"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  Home,
  Link as LinkIcon,
  QrCode,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { formatBytes, uploadConfig } from "@/lib/config";
import type { MenuRecord } from "@/lib/menu-types";
import {
  defaultQrDesign,
  downloadStyledQrPng,
} from "@/components/menu/styled-qr-code";
import PendingSubmitButton from "@/components/ui/pending-submit-button";

type DashboardAppProps = {
  deleteMenuAction: (formData: FormData) => void;
  error: string | null;
  initialBusinessName: string;
  initialMenus: MenuRecord[];
  message: string | null;
  uploadMenuAction: (formData: FormData) => void;
  plan: string;
  scansUsed: number;
};

const navItems = [
  { label: "Overview", icon: Home, href: "#overview" },
  { label: "QR codes", icon: QrCode, href: "/qr" },
  { label: "Settings", icon: Sparkles, href: "/dashboard/settings" },
  { label: "Billing", icon: CreditCard, href: "/dashboard/billing" },
  { label: "Landing page", icon: FileText, href: "/" },
];

export default function DashboardApp({
  deleteMenuAction,
  error,
  initialBusinessName,
  initialMenus,
  message,
  uploadMenuAction,
  plan,
  scansUsed,
}: DashboardAppProps) {
  const menus = initialMenus;
  const uploadLimit = plan === "monthly" ? 10 : plan === "yearly" ? 10 : 1;
  const isLimitReached = menus.length >= uploadLimit;

  const restaurantName =
    initialBusinessName || initialMenus[0]?.restaurantName || "";
  const [menuTitle, setMenuTitle] = useState("Product Catalog");
  const [localError, setLocalError] = useState<string | null>(null);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeMenus = useMemo(
    () => menus.filter((menu) => menu.isActive),
    [menus],
  );
  const restaurantCount = useMemo(
    () => new Set(menus.map((menu) => menu.restaurantId)).size,
    [menus],
  );

  const hasInteracted =
    selectedFile !== null || localError !== null || localMessage !== null;
  const displayError = localError ?? (!hasInteracted ? error : null);
  const displayMessage = localMessage ?? (!hasInteracted ? message : null);

  function publicUrl(slug: string, documentSlug: string) {
    return `${window.location.origin}/menu/${slug}/${documentSlug}`;
  }

  async function copyUrl(slug: string, documentSlug: string) {
    await navigator.clipboard.writeText(publicUrl(slug, documentSlug));
    setLocalError(null);
    setLocalMessage("Public document URL copied.");
  }

  async function downloadQr(menu: MenuRecord) {
    await downloadStyledQrPng(
      publicUrl(menu.slug, menu.documentSlug),
      defaultQrDesign,
      `${menu.slug}-qr.png`,
    );
  }

  function handleFile(file: File | null) {
    setSelectedFile(file);
    setLocalError(null);
    setLocalMessage(null);
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setLocalError("Hanya file PDF yang bisa diupload.");
      return;
    }

    if (file.size === 0) {
      setLocalError("File yang dipilih kosong atau rusak.");
      return;
    }

    if (file.size > uploadConfig.maxPdfBytes) {
      setLocalError(
        `PDF terlalu besar. Batas maksimal ${formatBytes(uploadConfig.maxPdfBytes)}.`,
      );
      return;
    }

    setLocalMessage("PDF siap diupload.");
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      {plan === "free" && scansUsed >= 1000 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm animate-fade-in">
          <AlertCircle className="shrink-0 text-red-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-red-900">Batas Scan Bulanan Tercapai</h4>
            <p className="mt-1 text-xs text-red-700 leading-relaxed">
              Menu Anda telah di-scan sebanyak {scansUsed.toLocaleString("id-ID")} kali. Halaman menu publik Anda saat ini dinonaktifkan sementara.
              Silakan <a href="/dashboard/billing" className="font-bold underline hover:text-red-900">upgrade ke paket Premium</a> untuk membuka akses tak terbatas.
            </p>
          </div>
        </div>
      )}
      <div id="overview" className="scroll-mt-28">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Active documents", activeMenus.length.toString(), FileCheck2],
            ["Workspaces", restaurantCount.toString(), QrCode],
            ["Published links", menus.length.toString(), BarChart3],
          ].map(([label, value, Icon]) => (
            <div
              key={label as string}
              className="rounded-3xl border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#666a61]">
                  {label as string}
                </p>
                <Icon className="text-[var(--green)]" size={21} />
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-tight">
                {value as string}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[390px_1fr]">
          <aside className="space-y-5">
            <form
              action={uploadMenuAction}
              encType="multipart/form-data"
              onSubmit={(event) => {
                if (isLimitReached) {
                  event.preventDefault();
                  setLocalError(
                    `Batas upload tercapai. Paket kamu hanya mendukung ${uploadLimit} dokumen PDF.`,
                  );
                  return;
                }
                if (localError || !selectedFile) {
                  event.preventDefault();
                }
              }}
              className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isLimitReached ? "bg-red-50 text-red-500" : "bg-[var(--green-soft)] text-[var(--green)]"}`}
                >
                  {isLimitReached ? (
                    <AlertCircle size={21} />
                  ) : (
                    <Upload size={21} />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">Upload dokumen PDF</h2>
                  <p className="text-sm text-[#666a61]">
                    Maksimal {formatBytes(uploadConfig.maxPdfBytes)}
                  </p>
                </div>
              </div>
              <input
                name="restaurantName"
                type="hidden"
                value={restaurantName}
              />
              <label className="mt-4 block text-sm font-semibold">
                Document title
                <input
                  name="title"
                  value={menuTitle}
                  onChange={(event) => setMenuTitle(event.target.value)}
                  className={`mt-2 min-h-12 w-full rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 outline-none transition ${
                    isLimitReached
                      ? "cursor-not-allowed opacity-60"
                      : "focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15"
                  }`}
                  required
                  disabled={isLimitReached}
                />
              </label>

              <label
                onDragEnter={() => !isLimitReached && setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  if (isLimitReached) return;
                  const file = event.dataTransfer.files?.[0] ?? null;
                  if (fileRef.current && event.dataTransfer.files.length) {
                    fileRef.current.files = event.dataTransfer.files;
                  }
                  handleFile(file);
                }}
                className={`mt-5 flex min-h-[170px] flex-col items-center justify-center rounded-3xl border border-dashed p-5 text-center transition ${
                  isLimitReached
                    ? "border-red-200 bg-red-50/20 cursor-not-allowed"
                    : isDragging
                      ? "border-[var(--green)] bg-[#eef6ed]"
                      : "border-[#d3c8b8] bg-[#fbf7ef] hover:border-[#cbd5e1] cursor-pointer"
                }`}
              >
                <input
                  ref={fileRef}
                  name="pdf"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  required
                  disabled={isLimitReached}
                  onChange={(event) =>
                    handleFile(event.target.files?.[0] ?? null)
                  }
                />
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ${isLimitReached ? "text-red-500" : "text-[var(--green)]"}`}
                >
                  {isLimitReached ? (
                    <AlertCircle size={22} />
                  ) : (
                    <FileText size={22} />
                  )}
                </div>
                <p className="mt-4 text-sm font-semibold">
                  {isLimitReached
                    ? "Batas upload tercapai"
                    : "Tarik PDF ke sini atau klik untuk pilih"}
                </p>
                <p className="mt-1 text-xs text-[#777a72]">
                  {isLimitReached
                    ? `Upgrade paket untuk upload lebih dari ${uploadLimit} file.`
                    : `PDF minimal ${formatBytes(uploadConfig.pdfCompressionThresholdBytes)} akan dioptimalkan sebelum upload.`}
                </p>
                {selectedFile && !isLimitReached ? (
                  <div className="mt-4 w-full rounded-2xl border border-[#e1d8ca] bg-white p-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-10 items-center justify-center rounded-xl bg-[#f1ebe1]">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-[#777a72]">
                          {formatBytes(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </label>

              <PendingSubmitButton
                className={`mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white transition ${
                  isLimitReached
                    ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                    : "bg-[var(--green)] hover:-translate-y-0.5 hover:bg-[var(--green-dark)]"
                }`}
                pendingText="Mengoptimalkan & mengupload"
                disabled={!!localError || !selectedFile || isLimitReached}
              >
                <Upload size={17} />
                Upload document
              </PendingSubmitButton>
            </form>

            <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm">
              <h2 className="font-semibold">QR management</h2>
              <p className="mt-2 text-sm leading-6 text-[#666a61]">
                Download a QR for each active document or copy the public link
                for sharing channels.
              </p>
              <a
                href="/qr"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#d9d0c2] bg-[#fbf7ef] px-4 text-sm font-semibold transition hover:bg-white"
              >
                <QrCode size={17} />
                Open QR page
              </a>
            </div>
          </aside>

          <section className="overflow-hidden rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] shadow-[var(--shadow-card)]">
            <div className="border-b border-[#e4dbce] p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Uploaded documents
                  </h2>
                  <p className="mt-1 text-sm text-[#666a61]">
                    {activeMenus.length} active public document
                    {activeMenus.length === 1 ? "" : "s"}
                  </p>
                </div>
                {displayError ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{displayError}</span>
                  </div>
                ) : displayMessage ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-[#cfe1cf] bg-[#eef6ed] px-3 py-2 text-sm font-medium text-[var(--green-dark)]">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{displayMessage}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-2xl border border-[#e4dbce] bg-[#fbf7ef] px-3 py-2 text-sm font-medium text-[#666a61]">
                    <span>Document URLs synced</span>
                  </div>
                )}
              </div>
            </div>

            <div className="divide-y divide-[#ece4d8]">
              {menus.length === 0 ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#f3ede3]">
                    <FileText size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">
                    No documents yet
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#666a61]">
                    Upload a PDF to create the first public showcase and QR
                    code.
                  </p>
                </div>
              ) : (
                menus.map((menu, index) => {
                  const isWithinLimit = index < uploadLimit;
                  const isActive = menu.isActive && isWithinLimit;

                  return (
                    <article
                      key={menu.id}
                      className={`grid gap-4 p-5 transition hover:bg-[#fbf7ef] lg:grid-cols-[1fr_auto] ${
                        !isWithinLimit ? "opacity-75" : ""
                      }`}
                    >
                      <div className="flex gap-4">
                        <div
                          className={`flex h-16 w-14 shrink-0 items-center justify-center rounded-2xl border ${
                            !isWithinLimit
                              ? "border-red-100 bg-red-50/30 text-red-400"
                              : "border-[#e5dccf] bg-[#f7f1e7] text-[var(--green)]"
                          }`}
                        >
                          <FileText size={24} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{menu.title}</h3>
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#eef6ed] px-2.5 py-1 text-xs font-semibold text-[var(--green-dark)]">
                                <CheckCircle2 size={13} />
                                Active
                              </span>
                            ) : !isWithinLimit ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700">
                                <AlertCircle size={13} />
                                Inactive (Plan Limit)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-[#666a61]">
                            {menu.restaurantName} - /menu/{menu.slug}/
                            {menu.documentSlug}
                          </p>
                          {isWithinLimit ? (
                            <a
                              href={`/menu/${menu.slug}/${menu.documentSlug}`}
                              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--green)] transition hover:text-[var(--green-dark)]"
                            >
                              <LinkIcon size={15} />
                              Open public document
                            </a>
                          ) : (
                            <span
                              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 cursor-not-allowed"
                              title="This document is inactive because your plan limit is exceeded."
                            >
                              <LinkIcon size={15} />
                              Open public document (Inactive)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => copyUrl(menu.slug, menu.documentSlug)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d9d0c2] bg-white px-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[#fbf7ef]"
                        >
                          <Copy size={16} />
                          Copy
                        </button>
                        <button
                          onClick={() => downloadQr(menu)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d9d0c2] bg-white px-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[#fbf7ef]"
                        >
                          <Download size={16} />
                          QR
                        </button>
                        <form action={deleteMenuAction}>
                          <input name="menuId" type="hidden" value={menu.id} />
                          <input
                            name="storageUrl"
                            type="hidden"
                            value={menu.pdfUrl}
                          />
                          <PendingSubmitButton
                            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-50"
                            pendingText="Deleting"
                          >
                            <Trash2 size={16} />
                            Delete
                          </PendingSubmitButton>
                        </form>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
