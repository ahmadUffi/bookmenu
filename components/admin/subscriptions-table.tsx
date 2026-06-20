"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import AdjustSubModal from "./adjust-sub-modal";

type SubRow = {
  id: string;
  userEmail: string;
  plan: string;
  price: number;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
  daysLeft: number | null;
  status: string;
};

const planBadge: Record<string, string> = {
  free: "bg-slate-100 text-slate-500",
  monthly: "bg-blue-50 text-blue-600 border border-blue-100",
  yearly: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  promo: "bg-amber-50 text-amber-600 border border-amber-100",
};

export default function SubscriptionsTable({ rows }: { rows: SubRow[] }) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter((r) => {
      const matchSearch = !q || r.userEmail.toLowerCase().includes(q);
      const matchPlan = planFilter === "all" || r.plan === planFilter;
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchPlan && matchStatus;
    });
  }, [rows, search, planFilter, statusFilter]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">All Subscriptions</h2>
            <p className="text-xs text-slate-400">{filtered.length} / {rows.length} subscriptions</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-48 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-600 outline-none"
            >
              <option value="all">All plans</option>
              <option value="free">Free</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="promo">Promo</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-600 outline-none"
            >
              <option value="all">All status</option>
              <option value="paid">Paid</option>
              <option value="free">Free</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {["User", "Plan", "Price", "Started", "Expires", "Days Left", "Status", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">
                  Tidak ada hasil untuk filter ini
                </td>
              </tr>
            ) : filtered.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50">
                <td className="px-5 py-3.5 text-slate-500">{row.userEmail}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${planBadge[row.plan] ?? planBadge.free}`}>
                    {row.plan}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-semibold tabular-nums text-slate-700">
                  {row.price === 0 ? <span className="text-slate-400">Free</span> : `Rp${Number(row.price).toLocaleString("id-ID")}`}
                </td>
                <td className="px-5 py-3.5 tabular-nums text-slate-400">
                  {new Date(row.startedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5 tabular-nums text-slate-400">
                  {row.endedAt ? new Date(row.endedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </td>
                <td className="px-5 py-3.5">
                  {row.daysLeft !== null ? (
                    <span className={`text-sm font-bold tabular-nums ${row.daysLeft > 7 ? "text-emerald-600" : row.daysLeft > 0 ? "text-amber-600" : "text-red-600"}`}>
                      {row.daysLeft > 0 ? `${row.daysLeft}d` : "Expired"}
                    </span>
                  ) : (
                    <span className="text-slate-300">∞</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    row.status === "paid" ? "bg-emerald-50 text-emerald-600" :
                    row.status === "free" ? "bg-slate-100 text-slate-500" :
                    "bg-amber-50 text-amber-600"
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {row.endedAt ? (
                    <AdjustSubModal subId={row.id} userEmail={row.userEmail} endedAt={row.endedAt} />
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
