"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode as QrCodeIcon } from "lucide-react";

type QrCardProps = {
  value: string;
  filename: string;
};

export default function QrCard({ value, filename }: QrCardProps) {
  const [qr, setQr] = useState("");

  useEffect(() => {
    const absoluteValue = value.startsWith("/")
      ? `${window.location.origin}${value}`
      : value;

    QRCode.toDataURL(absoluteValue, {
      width: 640,
      margin: 2,
      color: { dark: "#1f211d", light: "#fffdf8" },
    }).then(setQr);
  }, [value]);

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
      {qr ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qr}
          alt="Document QR code"
          className="mt-4 aspect-square w-full rounded-3xl border border-[#eee6da] bg-[#fbf7ef] p-3"
        />
      ) : (
        <div className="mt-4 aspect-square w-full animate-pulse rounded-3xl bg-[#f3ede3]" />
      )}
      <a
        href={qr}
        download={`${filename}.png`}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--charcoal)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#30332d]"
      >
        <Download size={17} />
        Download QR
      </a>
    </div>
  );
}
