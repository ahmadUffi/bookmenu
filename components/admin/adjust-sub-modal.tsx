"use client";

import { useState } from "react";
import { CalendarDays, Minus, Plus } from "lucide-react";
import { adjustSubscriptionDays } from "@/app/admin/subscriptions/actions";

type Props = { subId: string; userEmail: string; endedAt: string };

export default function AdjustSubModal({ subId, userEmail, endedAt }: Props) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentEnd = new Date(endedAt);
  const previewEnd = new Date(endedAt);
  previewEnd.setDate(previewEnd.getDate() + days);

  async function handleConfirm() {
    if (days === 0) return;
    setLoading(true);
    await adjustSubscriptionDays(subId, days);
    setLoading(false);
    setOpen(false);
    setDays(0);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
      >
        <CalendarDays size={12} />
        Adjust
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="font-semibold text-slate-800">Adjust subscription</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">{userEmail}</p>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Expires saat ini</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {currentEnd.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Tambah / kurangi hari</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDays((d) => Math.max(-365, d - 1))}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={days}
                    min={-365}
                    max={365}
                    onChange={(e) => setDays(Math.min(365, Math.max(-365, parseInt(e.target.value) || 0)))}
                    className="h-9 w-20 rounded-lg border border-slate-200 bg-white text-center text-sm font-semibold text-slate-800 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                  />
                  <button
                    type="button"
                    onClick={() => setDays((d) => Math.min(365, d + 1))}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {days !== 0 ? (
                <div className={`rounded-xl px-4 py-3 text-xs font-semibold ${
                  days > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}>
                  Expires baru: {previewEnd.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  {" "}({days > 0 ? `+${days}` : days} hari)
                </div>
              ) : null}
            </div>

            <div className="flex gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={() => { setOpen(false); setDays(0); }}
                className="flex-1 cursor-pointer rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={days === 0 || loading}
                className="flex-1 cursor-pointer rounded-lg bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
              >
                {loading ? "Menyimpan..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
