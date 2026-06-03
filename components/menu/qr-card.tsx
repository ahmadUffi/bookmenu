"use client";

import { useState } from "react";
import { Download, QrCode as QrCodeIcon } from "lucide-react";
import StyledQrCode, {
  defaultQrDesign,
  downloadStyledQrPng,
} from "@/components/menu/styled-qr-code";

type QrCardProps = {
  value: string;
  filename: string;
};

export default function QrCard({ value, filename }: QrCardProps) {
  const [origin] = useState(() =>
    typeof window === "undefined" ? "" : window.location.origin,
  );
  const absoluteValue = origin && value.startsWith("/") ? `${origin}${value}` : value;

  return (
    <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Share QR code</h2>
          <p className="mt-1 text-xs font-medium text-[#73766e]">Ready to print</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--green-soft)] text-[var(--green)]">
          <QrCodeIcon size={19} />
        </div>
      </div>
      <StyledQrCode
        value={absoluteValue}
        design={defaultQrDesign}
        title="Document QR code"
        className="mt-4 aspect-square w-full rounded-3xl border border-[#eee6da] bg-[#fbf7ef] p-3"
      />
      <button
        type="button"
        onClick={() => downloadStyledQrPng(absoluteValue, defaultQrDesign, `${filename}.png`)}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--charcoal)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#30332d]"
      >
        <Download size={17} />
        Download QR
      </button>
    </div>
  );
}
