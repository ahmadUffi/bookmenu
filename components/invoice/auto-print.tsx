"use client";

import { useEffect } from "react";

export default function AutoPrint() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 800); // Wait 800ms for styles and layout to stabilize
    return () => clearTimeout(timer);
  }, []);

  return null;
}

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#426b4f] px-5 text-xs font-semibold text-white transition hover:bg-[#34533e] active:scale-95 cursor-pointer shadow-xs"
    >
      Cetak Invoice (Print)
    </button>
  );
}
