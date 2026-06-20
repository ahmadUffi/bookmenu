"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import WorkspaceActionsMenu from "./workspace-actions-menu";

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  ownerEmail: string;
  menuCount: number;
  qrScans: number;
  menus: { id: string; title: string; pdfUrl: string; isActive: boolean }[];
};

export default function WorkspacesTable({ rows }: { rows: WorkspaceRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter((r) => {
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.ownerEmail.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || (statusFilter === "active" ? r.isActive : !r.isActive);
      return matchSearch && matchStatus;
    });
  }, [rows, search, statusFilter]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">All Workspaces</h2>
            <p className="text-xs text-slate-400">{filtered.length} / {rows.length} workspaces</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, owner, slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-52 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-600 outline-none"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {["Workspace", "Slug", "Owner", "Docs", "QR Scans", "Status", "Actions"].map((h) => (
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
            ) : filtered.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50">
                <td className="px-5 py-3.5 font-medium text-slate-800">{row.name}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-slate-400">/{row.slug}</td>
                <td className="px-5 py-3.5 text-slate-500">{row.ownerEmail}</td>
                <td className="px-5 py-3.5 tabular-nums text-slate-500">{row.menuCount}</td>
                <td className="px-5 py-3.5 tabular-nums text-slate-500">{row.qrScans.toLocaleString("id-ID")}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    row.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}>
                    {row.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <WorkspaceActionsMenu
                    restaurantId={row.id}
                    restaurantName={row.name}
                    isActive={row.isActive}
                    menus={row.menus}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
