"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

type TransactionRow = {
  userId: string;
  userEmail: string;
  plan: string;
  price: number;
  createdAt: string;
  status: string;
};

export default function TransactionsTable({ rows }: { rows: TransactionRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter((r) => {
      const matchSearch = !q || r.userEmail.toLowerCase().includes(q) || r.plan.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const rowDate = new Date(r.createdAt);
      const matchFrom = !dateFrom || rowDate >= new Date(dateFrom);
      const matchTo = !dateTo || rowDate <= new Date(dateTo + "T23:59:59");
      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [rows, search, statusFilter, dateFrom, dateTo]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">All Transactions</h2>
            <p className="text-xs text-slate-400">{filtered.length} / {rows.length} transactions</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search email, plan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-48 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-600 outline-none"
            >
              <option value="all">All status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="From date"
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-600 outline-none"
            />
            <span className="text-xs text-slate-300">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="To date"
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-600 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {["User", "Plan", "Amount", "Date", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                  Tidak ada hasil untuk filter ini
                </td>
              </tr>
            ) : filtered.map((row, i) => (
              <tr key={i} className="transition-colors hover:bg-slate-50">
                <td className="px-5 py-3.5 text-slate-500">{row.userEmail}</td>
                <td className="px-5 py-3.5 font-semibold capitalize text-slate-700">{row.plan}</td>
                <td className="px-5 py-3.5 font-semibold tabular-nums text-slate-800">
                  Rp{Number(row.price).toLocaleString("id-ID")}
                </td>
                <td className="px-5 py-3.5 tabular-nums text-slate-400">
                  {new Date(row.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    row.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {row.status === "paid" ? "Paid" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
