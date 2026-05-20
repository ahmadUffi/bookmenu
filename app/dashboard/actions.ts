"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { formatBytes, logoUploadConfig, uploadConfig } from "@/lib/config";
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

function getStoragePath(url: string, bucket: string) {
  const pathMarker = `/storage/v1/object/public/${bucket}/`;
  return url.includes(pathMarker)
    ? decodeURIComponent(url.split(pathMarker)[1] ?? "")
    : "";
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

export async function uploadMenu(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = uploadSchema.safeParse({
    restaurantName: formData.get("restaurantName"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    dashboardError("Restaurant name and menu title are required.");
  }

  const file = formData.get("pdf");

  if (!(file instanceof File) || file.size === 0) {
    dashboardError("Choose a PDF menu before uploading.");
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    dashboardError("Only PDF files are accepted.");
  }

  if (file.size > uploadConfig.maxPdfBytes) {
    dashboardError(`PDF is too large. Limit is ${formatBytes(uploadConfig.maxPdfBytes)}.`);
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
        createRestaurantError?.message ?? "Unable to create restaurant profile.",
      );
    }

    restaurant = createdRestaurant;
  }

  const cleanFileName = slugify(file.name.replace(/\.pdf$/i, "")) || "menu";
  const storagePath = `${user.id}/${restaurant.slug}-${Date.now()}-${cleanFileName}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from(uploadConfig.bucket)
    .upload(storagePath, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    dashboardError(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(uploadConfig.bucket).getPublicUrl(storagePath);

  const { error: menuError } = await supabase.from("menus").insert({
    restaurant_id: restaurant.id,
    title: parsed.data.title,
    pdf_url: publicUrl,
    is_active: true,
  });

  if (menuError) {
    dashboardError(menuError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/menu/${restaurant.slug}`);
  redirect(`/dashboard?message=${encodeURIComponent("Menu uploaded and published.")}`);
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
    dashboardError("Restaurant profile not found.");
  }

  const logoFile = formData.get("logo");
  let nextLogoUrl = restaurant.logo_url ?? null;
  let uploadedLogoPath: string | null = null;

  if (logoFile instanceof File && logoFile.size > 0) {
    if (!logoFile.type.startsWith("image/")) {
      dashboardError("Logo must be an image file.");
    }

    if (logoFile.size > logoUploadConfig.maxImageBytes) {
      dashboardError(`Logo is too large. Limit is ${formatBytes(logoUploadConfig.maxImageBytes)}.`);
    }

    const fileExt = logoFile.name.split(".").pop()?.toLowerCase() || "png";
    const cleanFileName = slugify(logoFile.name.replace(/\.[^.]+$/, "")) || "logo";
    uploadedLogoPath = `${user.id}/${restaurant.slug}-${Date.now()}-${cleanFileName}.${fileExt}`;

    const { error: logoUploadError } = await supabase.storage
      .from(logoUploadConfig.bucket)
      .upload(uploadedLogoPath, logoFile, {
        contentType: logoFile.type,
        upsert: false,
      });

    if (logoUploadError) {
      dashboardError(logoUploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(logoUploadConfig.bucket).getPublicUrl(uploadedLogoPath);

    nextLogoUrl = publicUrl;
  }

  const { error: updateError } = await supabase
    .from("restaurants")
    .update({
      restaurant_name: parsed.data.businessName,
      logo_url: nextLogoUrl,
    })
    .eq("id", restaurant.id);

  if (updateError) {
    if (uploadedLogoPath) {
      await supabase.storage.from(logoUploadConfig.bucket).remove([uploadedLogoPath]);
    }
    dashboardError(updateError.message);
  }

  const previousLogoPath =
    restaurant.logo_url && restaurant.logo_url !== nextLogoUrl
      ? getStoragePath(restaurant.logo_url, logoUploadConfig.bucket)
      : "";

  if (previousLogoPath) {
    await supabase.storage.from(logoUploadConfig.bucket).remove([previousLogoPath]);
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
    dashboardError("Menu id is required.");
  }

  const storagePath = getStoragePath(storageUrl, uploadConfig.bucket);

  const { error } = await supabase.from("menus").delete().eq("id", menuId);

  if (error) {
    dashboardError(error.message);
  }

  if (storagePath) {
    await supabase.storage.from(uploadConfig.bucket).remove([storagePath]);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard?message=${encodeURIComponent("Menu deleted.")}`);
}
