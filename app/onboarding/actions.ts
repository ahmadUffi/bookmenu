"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { uniqueSlug } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";

const businessSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
});

export async function createBusinessProfile(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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

  const parsed = businessSchema.safeParse({
    businessName: formData.get("businessName"),
  });

  if (!parsed.success) {
    redirect("/onboarding?error=Business%20name%20is%20required");
  }

  const { data: existing } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existing) {
    redirect("/dashboard");
  }

  const { error } = await supabase.from("restaurants").insert({
    owner_id: user.id,
    restaurant_name: parsed.data.businessName,
    slug: uniqueSlug(parsed.data.businessName),
  });

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?message=Workspace%20profile%20created");
}
