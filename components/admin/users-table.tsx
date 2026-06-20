"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import UserActionsMenu from "./user-actions-menu";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  workspace: string;
  plan: string;
};

const planBadge: Record<string, string> = {
  free: "bg-slate-100 text-slate-500",
  monthly: "bg-blue-50 text-blue-600 border border-blue-100",
  yearly: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  promo: "bg-amber-50 text-amber-600 border border-amber-100",
};

export default function UsersTable({ rows }: { rows: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter((r) => {
      const matchSearch = !q || r.email.toLowerCase().includes(q) || (r.name ?? "").toLowerCase().includes(q) || r.workspace.toLowerCase().includes(q);
      const matchPlan = planFilter === "all" || r.plan === planFilter;
      const matchStatus = statusFilter === "all" || (statusFilter === "active" ? r.isActive : !r.isActive);
      return matchSearch && matchPlan && matchStatus;
    });
  }, [rows, search, planFilter, statusFilter]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header + Filters */}
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">All Users</h2>
            <p className="text-xs text-slate-400">{filtered.length} / {rows.length} users</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search email, name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-52 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2">
              <SlidersHorizontal size={12} className="text-slate-400" />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="h-8 bg-transparent text-xs text-slate-600 outline-none"
              >
                <option value="all">All plans</option>
                <option value="free">Free</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="promo">Promo</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-600 outline-none"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {["Name", "Email", "Workspace", "Plan", "Joined", "Status", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                  Tidak ada hasil untuk filter ini
                </td>
              </tr>
            ) : filtered.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-slate-50">
                <td className="px-5 py-3.5 font-medium text-slate-800">{user.name || "—"}</td>
                <td className="px-5 py-3.5 text-slate-500">{user.email}</td>
                <td className="px-5 py-3.5 text-slate-500">{user.workspace}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${planBadge[user.plan] ?? planBadge.free}`}>
                    {user.plan}
                  </span>
                </td>
                <td className="px-5 py-3.5 tabular-nums text-slate-400">
                  {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    user.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}>
                    {user.isActive ? "Active" : "Banned"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {user.role !== "admin" ? (
                    <UserActionsMenu userId={user.id} userName={user.name} isActive={user.isActive} />
                  ) : (
                    <span className="text-xs text-slate-400">Admin</span>
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
