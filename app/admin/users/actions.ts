"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");
}

export async function banUser(userId: string) {
  await requireAdmin();
  const adminDb = createAdminClient();
  await adminDb.from("users").update({ is_active: false }).eq("id", userId);
  revalidatePath("/admin/users");
}

export async function unbanUser(userId: string) {
  await requireAdmin();
  const adminDb = createAdminClient();
  await adminDb.from("users").update({ is_active: true }).eq("id", userId);
  revalidatePath("/admin/users");
}
