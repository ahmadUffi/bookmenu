import { createAdminClient } from "@/lib/supabase/admin";
import SubscriptionsTable from "@/components/admin/subscriptions-table";

export default async function AdminSubscriptionsPage() {
  const adminDb = createAdminClient();

  const { data: subs } = await adminDb
    .from("subscriptions")
    .select("id, user_id, plan, price, started_at, ended_at, created_at, qrisly_response")
    .order("ended_at", { ascending: false });

  const userIds = [...new Set((subs ?? []).map((s) => s.user_id))];

  const { data: users } = userIds.length
    ? await adminDb.from("users").select("id, email").in("id", userIds)
    : { data: [] };

  const userEmailMap = new Map((users ?? []).map((u) => [u.id, u.email]));

  const now = new Date();

  const rows = (subs ?? []).map((sub) => {
    const endDate = sub.ended_at ? new Date(sub.ended_at) : null;
    const daysLeft = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const payStatus = (sub.qrisly_response as { status?: string } | null)?.status?.toLowerCase();
    const status =
      sub.price === 0 ? "free"
      : payStatus === "success" || payStatus === "paid" ? "paid"
      : "pending";

    return {
      id: sub.id,
      userEmail: userEmailMap.get(sub.user_id) ?? "—",
      plan: sub.plan,
      price: sub.price,
      startedAt: sub.started_at,
      endedAt: sub.ended_at,
      isActive: endDate ? endDate > now : sub.price === 0,
      daysLeft,
      status,
    };
  });

  return (
    <div className="p-4 md:p-6">
      <SubscriptionsTable rows={rows} />
    </div>
  );
}
