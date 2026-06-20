import { createAdminClient } from "@/lib/supabase/admin";
import RevenueCharts from "@/components/admin/revenue-charts";
import TransactionsTable from "@/components/admin/transactions-table";
import { TrendingUp, CreditCard, Clock } from "lucide-react";

export default async function AdminRevenuePage() {
  const adminDb = createAdminClient();

  const { data: subs } = await adminDb
    .from("subscriptions")
    .select("user_id, plan, price, created_at, ended_at, qrisly_response")
    .gt("price", 0)
    .order("created_at", { ascending: false });

  const userIds = [...new Set((subs ?? []).map((s) => s.user_id))];
  const { data: users } = userIds.length
    ? await adminDb.from("users").select("id, email").in("id", userIds)
    : { data: [] };
  const userEmailMap = new Map((users ?? []).map((u) => [u.id, u.email]));

  const paid = (subs ?? []).filter((s) => {
    const status = (s.qrisly_response as { status?: string } | null)?.status?.toLowerCase();
    return status === "success" || status === "paid";
  });

  const totalRevenue = paid.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const pendingRevenue = (subs ?? [])
    .filter((s) => {
      const status = (s.qrisly_response as { status?: string } | null)?.status?.toLowerCase();
      return status !== "success" && status !== "paid";
    })
    .reduce((sum, s) => sum + (Number(s.price) || 0), 0);

  // Monthly revenue for chart
  const monthlyMap = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    monthlyMap.set(key, 0);
  }
  for (const sub of paid) {
    const d = new Date(sub.created_at);
    const key = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(sub.price));
    }
  }
  const monthlyRevenue = Array.from(monthlyMap.entries()).map(([month, revenue]) => ({ month, revenue }));

  const transactionRows = (subs ?? []).map((s) => {
    const status = (s.qrisly_response as { status?: string } | null)?.status?.toLowerCase();
    return {
      userId: s.user_id,
      userEmail: userEmailMap.get(s.user_id) ?? "—",
      plan: s.plan,
      price: s.price,
      createdAt: s.created_at,
      status: status === "success" || status === "paid" ? "paid" : "pending",
    };
  });

  const statCards = [
    { label: "Total Revenue", value: `Rp${totalRevenue.toLocaleString("id-ID")}`, icon: TrendingUp, color: "text-emerald-400", border: "border-emerald-500/20" },
    { label: "Paid Transactions", value: paid.length, icon: CreditCard, color: "text-blue-400", border: "border-blue-500/20" },
    { label: "Pending Amount", value: `Rp${pendingRevenue.toLocaleString("id-ID")}`, icon: Clock, color: "text-amber-400", border: "border-amber-500/20" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`rounded-2xl border ${card.border} bg-[#0d1017] p-5`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a2035] ${card.color}`}>
                <Icon size={17} />
              </div>
              <p className={`mt-4 text-2xl font-bold tracking-tight ${card.color}`}>{card.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#1a1f2e] bg-[#0d1017]">
        <div className="border-b border-[#1a1f2e] px-5 py-4">
          <h2 className="text-base font-semibold text-slate-200">Monthly Revenue</h2>
          <p className="text-xs text-slate-500">12 bulan terakhir</p>
        </div>
        <div className="p-5">
          <RevenueCharts monthlyRevenue={monthlyRevenue} />
        </div>
      </section>

      <TransactionsTable rows={transactionRows} />
    </div>
  );
}
