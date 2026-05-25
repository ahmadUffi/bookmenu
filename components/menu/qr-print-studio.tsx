"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Check,
  Copy,
  Download,
  FileText,
  Printer,
  QrCode,
} from "lucide-react";
import type { MenuRecord } from "@/lib/menu-types";

type QrPrintStudioProps = {
  menus: MenuRecord[];
};

type LayoutSize = 4 | 6;

function chunk<T>(items: T[], size: number) {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

function getRelativeUrl(menu: MenuRecord) {
  return `/menu/${menu.slug}/${menu.documentSlug}`;
}

export default function QrPrintStudio({ menus }: QrPrintStudioProps) {
  const [selectedId, setSelectedId] = useState(menus[0]?.id ?? "");
  const [quantity, setQuantity] = useState(4);
  const [layoutSize, setLayoutSize] = useState<LayoutSize>(4);
  const [qrCache, setQrCache] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const selectedMenu = useMemo(
    () => menus.find((menu) => menu.id === selectedId) ?? menus[0] ?? null,
    [menus, selectedId],
  );

  const relativeUrl = selectedMenu ? getRelativeUrl(selectedMenu) : "";
  const qr = relativeUrl ? (qrCache[relativeUrl] ?? "") : "";
  const copies = useMemo(
    () => Array.from({ length: Math.max(1, quantity) }, (_, index) => index + 1),
    [quantity],
  );
  const pages = useMemo(() => chunk(copies, layoutSize), [copies, layoutSize]);

  useEffect(() => {
    if (!relativeUrl || qrCache[relativeUrl]) {
      return;
    }

    let cancelled = false;
    const absoluteUrl = `${window.location.origin}${relativeUrl}`;
    QRCode.toDataURL(absoluteUrl, {
      width: 900,
      margin: 2,
      color: { dark: "#151924", light: "#ffffff" },
    }).then((dataUrl) => {
      if (cancelled) return;
      setQrCache((current) => ({ ...current, [relativeUrl]: dataUrl }));
    });

    return () => {
      cancelled = true;
    };
  }, [qrCache, relativeUrl]);

  async function copyPublicUrl() {
    if (!relativeUrl) return;

    await navigator.clipboard.writeText(`${window.location.origin}${relativeUrl}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (!selectedMenu) {
    return (
      <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm">
        <h2 className="font-semibold">No active document</h2>
        <p className="mt-2 text-sm leading-6 text-[#666a61]">
          Upload a PDF document from the dashboard to generate printable QR
          cards.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-8 lg:grid-cols-[360px_1fr]">
      <aside className="qr-print-hide space-y-4">
        <section className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">Print setup</h2>
              <p className="mt-1 text-xs font-medium text-[#73766e]">
                Choose the PDF and card layout.
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--green-soft)] text-[var(--green)]">
              <QrCode size={19} />
            </div>
          </div>

          <label className="mt-5 block text-sm font-semibold">
            PDF document
            <select
              value={selectedMenu.id}
              onChange={(event) => setSelectedId(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 text-sm outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15"
            >
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.title}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block text-sm font-semibold">
            Print quantity
            <input
              min={1}
              max={120}
              type="number"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  Math.max(1, Math.min(120, Number(event.target.value) || 1)),
                )
              }
              className="mt-2 min-h-12 w-full rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 text-sm outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15"
            />
          </label>

          <div className="mt-4">
            <p className="text-sm font-semibold">A4 layout</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {([4, 6] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLayoutSize(value)}
                  className={`inline-flex min-h-11 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition ${
                    layoutSize === value
                      ? "border-[var(--charcoal)] bg-[var(--charcoal)] text-white"
                      : "border-[#d9d0c2] bg-[#fbf7ef] text-[#4d5149] hover:bg-white"
                  }`}
                >
                  {value} per A4
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#e1d8ca] bg-[#fbf7ef] p-4">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr}
                alt="Selected document QR code"
                className="mx-auto aspect-square w-full max-w-[220px] rounded-2xl bg-white p-3"
              />
            ) : (
              <div className="mx-auto aspect-square w-full max-w-[220px] animate-pulse rounded-2xl bg-[#e8eef5]" />
            )}
            <p className="mt-3 truncate text-center text-sm font-semibold">
              {selectedMenu.title}
            </p>
            <p className="mt-1 truncate text-center text-xs text-[#73766e]">
              {relativeUrl}
            </p>
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--charcoal)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#30332d]"
            >
              <Printer size={17} />
              Print A4 layout
            </button>
            <button
              type="button"
              onClick={copyPublicUrl}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#d9d0c2] bg-white px-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[#fbf7ef]"
            >
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "Copied" : "Copy public link"}
            </button>
            <a
              href={qr}
              download={`${selectedMenu.slug}-${selectedMenu.documentSlug}-qr.png`}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#d9d0c2] bg-white px-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[#fbf7ef]"
            >
              <Download size={17} />
              Download QR PNG
            </a>
          </div>
        </section>
      </aside>

      <section className="rounded-[2rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-[var(--shadow-card)] md:p-8">
        <div className="qr-print-hide flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--green)]">
              Printable layout
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              A4 QR sheet preview
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#666a61]">
              Preview follows the selected paper split. Printing uses actual A4
              sizing with one card per section.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e4dbce] bg-[#fbf7ef] px-4 py-3 text-sm font-semibold text-[#4d5149]">
            {quantity} card{quantity === 1 ? "" : "s"} across {pages.length} sheet
            {pages.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="qr-print-area mt-8 space-y-6">
          {pages.map((pageItems, pageIndex) => (
            <div
              key={pageIndex}
              className={`qr-print-sheet qr-print-sheet-${layoutSize} mx-auto grid aspect-[210/297] w-full max-w-[720px] gap-3 rounded-2xl border border-[#ded5c7] bg-white p-4 shadow-sm`}
            >
              {pageItems.map((copyNumber) => (
                <article
                  key={copyNumber}
                  className="qr-print-card flex flex-col justify-between rounded-2xl border border-[#dbe2ea] bg-[#fbf7ef] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--green)]">
                        {selectedMenu.restaurantName}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-xl font-semibold tracking-tight">
                        {selectedMenu.title}
                      </h3>
                    </div>
                    <FileText className="shrink-0 text-[var(--green)]" size={22} />
                  </div>

                  <div className="my-4 rounded-[1.25rem] bg-white p-3 shadow-sm">
                    {qr ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qr}
                        alt={`${selectedMenu.title} QR code`}
                        className="mx-auto aspect-square w-full max-w-[180px]"
                      />
                    ) : (
                      <div className="mx-auto aspect-square w-full max-w-[180px] animate-pulse rounded-xl bg-[#e8eef5]" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold">
                    <Check size={16} className="shrink-0 text-[var(--green)]" />
                    Scan to open this PDF
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
