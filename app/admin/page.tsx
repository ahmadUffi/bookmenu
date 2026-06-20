import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Users, Building2, CreditCard, TrendingUp, ShieldOff, PowerOff, ArrowRight } from "lucide-react";

export default async function AdminOverviewPage() {
  const adminDb = createAdminClient();

  const [
    { count: totalUsers },
    { count: bannedUsers },
    { count: totalWorkspaces },
    { count: inactiveWorkspaces },
    { count: activePaidSubs },
    { data: revenueData },
  ] = await Promise.all([
    adminDb.from("users").select("*", { count: "exact", head: true }),
    adminDb.from("users").select("*", { count: "exact", head: true }).eq("is_active", false),
    adminDb.from("restaurants").select("*", { count: "exact", head: true }),
    adminDb.from("restaurants").select("*", { count: "exact", head: true }).eq("is_active", false),
    adminDb
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .gt("ended_at", new Date().toISOString())
      .gt("price", 0),
    adminDb
      .from("subscriptions")
      .select("price")
      .in("qrisly_response->>status", ["success", "paid", "Success", "Paid"]),
  ]);

  const totalRevenue = (revenueData ?? []).reduce((sum, s) => sum + (Number(s.price) || 0), 0);

  const stats = [
    { label: "Total Users", value: totalUsers ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", href: "/admin/users" },
    { label: "Banned Users", value: bannedUsers ?? 0, icon: ShieldOff, color: "text-red-600", bg: "bg-red-50", border: "border-red-100", href: "/admin/users" },
    { label: "Total Workspaces", value: totalWorkspaces ?? 0, icon: Building2, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", href: "/admin/workspaces" },
    { label: "Inactive Workspaces", value: inactiveWorkspaces ?? 0, icon: PowerOff, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", href: "/admin/workspaces" },
    { label: "Total Revenue", value: `Rp${totalRevenue.toLocaleString("id-ID")}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", href: "/admin/revenue" },
    { label: "Active Paid Subs", value: activePaidSubs ?? 0, icon: CreditCard, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100", href: "/admin/subscriptions" },
  ];

  const quickLinks = [
    { label: "Manage Users", desc: "Ban, unban, view user details", href: "/admin/users" },
    { label: "Manage Workspaces", desc: "Enable, disable, delete menus", href: "/admin/workspaces" },
    { label: "Subscriptions", desc: "Adjust duration, monitor active subs", href: "/admin/subscriptions" },
    { label: "Revenue", desc: "Track payments and transactions", href: "/admin/revenue" },
    { label: "Analytics", desc: "User growth and engagement metrics", href: "/admin/analytics" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`group relative overflow-hidden rounded-2xl border ${stat.border} bg-white p-4 shadow-sm transition hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg}`}>
                  <Icon size={17} className={stat.color} />
                </div>
                <ArrowRight size={14} className="text-slate-300 transition group-hover:text-slate-500" />
              </div>
              <div className="mt-4">
                <p className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Quick Access</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{link.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{link.desc}</p>
              </div>
              <ArrowRight size={15} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
