"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDocumentSlug } from "@/lib/document-slug";
import { formatBytes, logoUploadConfig, uploadConfig } from "@/lib/config";
import { deleteR2Object, uploadR2Object } from "@/lib/r2-storage";
import { optimizePdfForUpload } from "@/lib/pdf-optimizer";
import { slugify, uniqueSlug } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";

const uploadSchema = z.object({
  restaurantName: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(120),
});

const settingsSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
});

function dashboardError(message: string): never {
  redirect(`/dashboard?error=${encodeURIComponent(message)}`);
}

async function deleteStoredObject(url: string) {
  try {
    await deleteR2Object(url);
  } catch (error) {
    console.error(error);
  }
}

async function requireUser() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "user") {
    redirect("/admin");
  }

  return { supabase, user };
}

async function createUniqueDocumentSlug(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  restaurantId: string,
  title: string,
) {
  const baseSlug = slugify(title) || "document";
  const { data, error } = await supabase
    .from("menus")
    .select("document_slug")
    .eq("restaurant_id", restaurantId)
    .like("document_slug", `${baseSlug}%`);

  if (error) {
    return slugify(title) || "document";
  }

  const existingSlugs = new Set(
    (data ?? []).map((menu) => String(menu.document_slug)),
  );

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

export async function uploadMenu(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = uploadSchema.safeParse({
    restaurantName: formData.get("restaurantName"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    dashboardError("Business name and document title are required.");
  }

  const file = formData.get("pdf");

  if (!(file instanceof File)) {
    dashboardError("Choose a PDF document before uploading.");
  }

  if (file.size === 0) {
    dashboardError("File PDF kosong atau rusak.");
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    dashboardError("Hanya file PDF yang bisa diupload.");
  }

  if (file.size > uploadConfig.maxPdfBytes) {
    dashboardError(`PDF terlalu besar. Batas maksimal ${formatBytes(uploadConfig.maxPdfBytes)}.`);
  }

  const { data: existingRestaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, slug, restaurant_name")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (restaurantError) {
    dashboardError(restaurantError.message);
  }

  let restaurant = existingRestaurant;

  if (!restaurant) {
    const slug = uniqueSlug(parsed.data.restaurantName);
    const { data: createdRestaurant, error: createRestaurantError } = await supabase
      .from("restaurants")
      .insert({
        owner_id: user.id,
        restaurant_name: parsed.data.restaurantName,
        slug,
      })
      .select("id, slug, restaurant_name")
      .single();

    if (createRestaurantError || !createdRestaurant) {
      dashboardError(
        createRestaurantError?.message ?? "Unable to create workspace profile.",
      );
    }

    restaurant = createdRestaurant;
  }

  // Enforce upload limits based on active subscription plan
  const nowStr = new Date().toISOString();
  const { data: activeSubs } = await supabase
    .from("subscriptions")
    .select("plan, price, qrisly_response")
    .eq("user_id", user.id)
    .gt("ended_at", nowStr)
    .order("created_at", { ascending: false });

  const activeSub = (activeSubs ?? []).find(sub => {
    if (sub.price === 0) return true;
    const responseStatus = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
      ? String((sub.qrisly_response as any).status).toLowerCase()
      : null;
    return responseStatus === "paid";
  });

  const plan = activeSub?.plan || "free";
  let uploadLimit = 1;
  if (plan === "monthly") {
    uploadLimit = 5;
  } else if (plan === "yearly") {
    uploadLimit = 5;
  }

  const { count, error: countError } = await supabase
    .from("menus")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id);

  if (countError) {
    dashboardError("Unable to verify current document count.");
  }

  if (count !== null && count >= uploadLimit) {
    dashboardError(
      `Batas upload tercapai. Paket aktif kamu (${plan}) hanya mendukung ${uploadLimit} dokumen PDF.`
    );
  }

  const documentSlug = await createUniqueDocumentSlug(
    supabase,
    restaurant.id,
    parsed.data.title,
  );
  const cleanFileName = slugify(file.name.replace(/\.pdf$/i, "")) || documentSlug;
  const storagePath = `${user.id}/${restaurant.slug}/${documentSlug}-${Date.now()}-${cleanFileName}.pdf`;
  const optimizedPdf = await optimizePdfForUpload(file);

  let publicUrl: string;

  try {
    publicUrl = await uploadR2Object({
      body: optimizedPdf.body,
      contentType: "application/pdf",
      key: storagePath,
    });
  } catch (error) {
    dashboardError(error instanceof Error ? error.message : "Unable to upload document.");
  }

  const menuPayload = {
    restaurant_id: restaurant.id,
    title: parsed.data.title,
    document_slug: documentSlug,
    pdf_url: publicUrl,
    is_active: true,
  };

  const { data: createdMenu, error: menuError } = await supabase
    .from("menus")
    .insert(menuPayload)
    .select("id, title, document_slug")
    .single();

  let publicDocumentSlug = documentSlug;

  if (menuError) {
    const { data: legacyMenu, error: legacyMenuError } = await supabase
      .from("menus")
      .insert({
        restaurant_id: restaurant.id,
        title: parsed.data.title,
        pdf_url: publicUrl,
        is_active: true,
      })
      .select("id, title")
      .single();

    if (legacyMenuError || !legacyMenu) {
      await deleteStoredObject(publicUrl);
      dashboardError(legacyMenuError?.message ?? menuError.message);
    }

    publicDocumentSlug = getDocumentSlug({
      id: legacyMenu.id,
      title: legacyMenu.title,
    });
  } else if (createdMenu) {
    publicDocumentSlug = getDocumentSlug(createdMenu);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/menu/${restaurant.slug}`);
  revalidatePath(`/menu/${restaurant.slug}/${publicDocumentSlug}`);
  const uploadMessage = optimizedPdf.optimized
    ? `PDF dioptimalkan dari ${formatBytes(optimizedPdf.originalBytes)} ke ${formatBytes(optimizedPdf.outputBytes)}.`
    : "PDF berhasil diupload.";
  redirect(`/dashboard?message=${encodeURIComponent(uploadMessage)}`);
}

export async function updateBusinessSettings(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = settingsSchema.safeParse({
    businessName: formData.get("businessName"),
  });

  if (!parsed.success) {
    dashboardError("Business name is required.");
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, slug, logo_url")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (restaurantError) {
    dashboardError(restaurantError.message);
  }

  if (!restaurant) {
    dashboardError("Business profile not found.");
  }

  const logoFile = formData.get("logo");
  let nextLogoUrl = restaurant.logo_url ?? null;

  if (logoFile instanceof File && logoFile.size > 0) {
    if (!logoFile.type.startsWith("image/")) {
      dashboardError("Logo must be an image file.");
    }

    if (logoFile.size > logoUploadConfig.maxImageBytes) {
      dashboardError(`Logo is too large. Limit is ${formatBytes(logoUploadConfig.maxImageBytes)}.`);
    }

    const fileExt = logoFile.name.split(".").pop()?.toLowerCase() || "png";
    const cleanFileName = slugify(logoFile.name.replace(/\.[^.]+$/, "")) || "logo";
    const uploadedLogoPath = `${user.id}/${restaurant.slug}-${Date.now()}-${cleanFileName}.${fileExt}`;

    try {
      nextLogoUrl = await uploadR2Object({
        body: logoFile,
        contentType: logoFile.type,
        key: uploadedLogoPath,
      });
    } catch (error) {
      dashboardError(error instanceof Error ? error.message : "Unable to upload logo.");
    }
  }

  const { error: updateError } = await supabase
    .from("restaurants")
    .update({
      restaurant_name: parsed.data.businessName,
      logo_url: nextLogoUrl,
    })
    .eq("id", restaurant.id);

  if (updateError) {
    if (nextLogoUrl && nextLogoUrl !== restaurant.logo_url) {
      await deleteStoredObject(nextLogoUrl);
    }
    dashboardError(updateError.message);
  }

  if (restaurant.logo_url && restaurant.logo_url !== nextLogoUrl) {
    await deleteStoredObject(restaurant.logo_url);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath(`/menu/${restaurant.slug}`);
  redirect(`/dashboard/settings?message=${encodeURIComponent("Settings updated.")}`);
}

export async function deleteMenu(formData: FormData) {
  const { supabase } = await requireUser();
  const menuId = String(formData.get("menuId") ?? "");
  const storageUrl = String(formData.get("storageUrl") ?? "");

  if (!menuId) {
    dashboardError("Document id is required.");
  }

  const { error } = await supabase.from("menus").delete().eq("id", menuId);

  if (error) {
    dashboardError(error.message);
  }

  await deleteStoredObject(storageUrl);

  revalidatePath("/dashboard");
  redirect(`/dashboard?message=${encodeURIComponent("Document deleted.")}`);
}
