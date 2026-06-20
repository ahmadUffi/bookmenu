import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/admin-shell";

const pageTitles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/users": "Users",
  "/admin/workspaces": "Workspaces",
  "/admin/subscriptions": "Subscriptions",
  "/admin/revenue": "Revenue",
  "/admin/analytics": "Analytics",
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
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

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return <AdminShell>{children}</AdminShell>;
}
