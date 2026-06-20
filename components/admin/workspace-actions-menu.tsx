"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MoreHorizontal, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toggleWorkspace, deleteMenuAdmin } from "@/app/admin/workspaces/actions";

type Menu = { id: string; title: string; pdfUrl: string; isActive: boolean };

type Props = {
  restaurantId: string;
  restaurantName: string;
  isActive: boolean;
  menus: Menu[];
};

export default function WorkspaceActionsMenu({ restaurantId, restaurantName, isActive, menus }: Props) {
  const [open, setOpen] = useState(false);
  const [showMenus, setShowMenus] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    setOpen(false);
    await toggleWorkspace(restaurantId, !isActive);
    setLoading(false);
  }

  async function handleDeleteMenu(menuId: string, pdfUrl: string) {
    if (!confirm("Hapus dokumen ini secara permanen?")) return;
    setLoading(true);
    await deleteMenuAdmin(menuId, pdfUrl);
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setShowMenus((v) => !v)}
        className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
      >
        Docs {showMenus ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={loading}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40"
          aria-label={`Actions for ${restaurantName}`}
        >
          <MoreHorizontal size={16} />
        </button>

        {open ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
            <div className="absolute right-0 top-9 z-20 min-w-[200px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              <button
                type="button"
                onClick={handleToggle}
                className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 ${
                  isActive ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {isActive ? (
                  <><ToggleLeft size={14} /> Deactivate</>
                ) : (
                  <><ToggleRight size={14} /> Activate</>
                )}
              </button>
            </div>
          </>
        ) : null}
      </div>

      {showMenus ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowMenus(false)}>
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="font-semibold text-slate-800">Dokumen — {restaurantName}</p>
              <p className="mt-0.5 text-xs text-slate-400">{menus.length} dokumen</p>
            </div>
            <div className="divide-y divide-slate-100 p-2">
              {menus.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-slate-400">Tidak ada dokumen</p>
              ) : menus.map((menu) => (
                <div key={menu.id} className="flex items-center justify-between rounded-xl px-3 py-3">
                  <span className="text-sm font-semibold text-slate-700">{menu.title}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteMenu(menu.id, menu.pdfUrl)}
                    disabled={loading}
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                    aria-label={`Hapus ${menu.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setShowMenus(false)}
                className="cursor-pointer text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
