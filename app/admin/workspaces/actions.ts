"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteR2Object } from "@/lib/r2-storage";

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

export async function toggleWorkspace(restaurantId: string, active: boolean) {
  await requireAdmin();
  const adminDb = createAdminClient();
  await adminDb
    .from("restaurants")
    .update({ is_active: active })
    .eq("id", restaurantId);
  revalidatePath("/admin/workspaces");
}

export async function deleteMenuAdmin(menuId: string, pdfUrl: string) {
  await requireAdmin();
  const adminDb = createAdminClient();
  await adminDb.from("menus").delete().eq("id", menuId);
  try {
    await deleteR2Object(pdfUrl);
  } catch {
    // file may already be gone
  }
  revalidatePath("/admin/workspaces");
}
