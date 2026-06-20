import { createAdminClient } from "@/lib/supabase/admin";
import AnalyticsCharts from "@/components/admin/analytics-charts";

export default async function AdminAnalyticsPage() {
  const adminDb = createAdminClient();

  const [
    { data: users },
    { data: usages },
    { data: activeSubs },
  ] = await Promise.all([
    adminDb.from("users").select("id, created_at").order("created_at", { ascending: true }),
    adminDb.from("subscription_usages").select("user_id, qr_scan").order("qr_scan", { ascending: false }).limit(10),
    adminDb.from("subscriptions").select("user_id, plan, ended_at, price").gt("ended_at", new Date().toISOString()),
  ]);

  const monthlyMap = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    monthlyMap.set(key, 0);
  }
  for (const user of users ?? []) {
    const d = new Date(user.created_at);
    const key = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
    }
  }
  let cumulative = 0;
  const userGrowth = Array.from(monthlyMap.entries()).map(([month, count]) => {
    cumulative += count;
    return { month, users: cumulative };
  });

  const userIds = (usages ?? []).map((u) => u.user_id);
  const { data: userEmails } = userIds.length
    ? await adminDb.from("users").select("id, email").in("id", userIds)
    : { data: [] };
  const emailMap = new Map((userEmails ?? []).map((u) => [u.id, u.email]));

  const topScans = (usages ?? []).map((u) => ({
    name: emailMap.get(u.user_id)?.split("@")[0] ?? "—",
    scans: u.qr_scan,
  }));

  const planCount = new Map<string, number>();
  for (const sub of activeSubs ?? []) {
    const plan = sub.price === 0 ? "free" : sub.plan;
    planCount.set(plan, (planCount.get(plan) ?? 0) + 1);
  }
  const paidUserIds = new Set((activeSubs ?? []).filter((s) => s.price > 0).map((s) => s.user_id));
  const freeUsersCount = (users ?? []).filter((u) => !paidUserIds.has(u.id)).length;
  planCount.set("free", freeUsersCount);

  const planDistribution = Array.from(planCount.entries()).map(([plan, count]) => ({ plan, count }));

  return (
    <div className="p-4 md:p-6">
      <AnalyticsCharts userGrowth={userGrowth} topScans={topScans} planDistribution={planDistribution} />
    </div>
  );
}
