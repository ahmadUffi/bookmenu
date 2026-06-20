import { createAdminClient } from "@/lib/supabase/admin";
import UsersTable from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const adminDb = createAdminClient();

  const { data: users } = await adminDb
    .from("users")
    .select(`id, name, email, role, is_active, created_at, restaurants(restaurant_name)`)
    .order("created_at", { ascending: false });

  const userIds = (users ?? []).map((u) => u.id);

  const { data: subs } = userIds.length
    ? await adminDb
        .from("subscriptions")
        .select("user_id, plan, ended_at")
        .in("user_id", userIds)
        .gt("ended_at", new Date().toISOString())
        .order("ended_at", { ascending: false })
    : { data: [] };

  const latestSubByUser = new Map<string, string>();
  for (const sub of subs ?? []) {
    if (!latestSubByUser.has(sub.user_id)) {
      latestSubByUser.set(sub.user_id, sub.plan);
    }
  }

  const rows = (users ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.is_active ?? true,
    createdAt: u.created_at,
    workspace: (u.restaurants as { restaurant_name: string }[] | null)?.[0]?.restaurant_name ?? "—",
    plan: latestSubByUser.get(u.id) ?? "free",
  }));

  return (
    <div className="p-4 md:p-6">
      <UsersTable rows={rows} />
    </div>
  );
}
