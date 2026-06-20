"use client";

import { useState } from "react";
import { MoreHorizontal, ShieldOff, ShieldCheck } from "lucide-react";
import { banUser, unbanUser } from "@/app/admin/users/actions";

type Props = { userId: string; userName: string; isActive: boolean };

export default function UserActionsMenu({ userId, userName, isActive }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    setOpen(false);
    if (isActive) {
      await banUser(userId);
    } else {
      await unbanUser(userId);
    }
    setLoading(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40"
        aria-label={`Actions for ${userName}`}
      >
        <MoreHorizontal size={16} />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-9 z-20 min-w-[180px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={handleToggle}
              className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 ${
                isActive ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {isActive ? (
                <><ShieldOff size={14} /> Ban user</>
              ) : (
                <><ShieldCheck size={14} /> Unban user</>
              )}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
