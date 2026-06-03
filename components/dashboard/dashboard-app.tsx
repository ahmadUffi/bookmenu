"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Copy,
  Download,
  FileCheck2,
  FileText,
  Home,
  Link as LinkIcon,
  LogOut,
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
};

const navItems = [
  { label: "Overview", icon: Home, href: "#overview" },
  { label: "QR codes", icon: QrCode, href: "/qr" },
  { label: "Settings", icon: Sparkles, href: "/dashboard/settings" },
  { label: "Landing page", icon: FileText, href: "/" },
];

export default function DashboardApp({
  deleteMenuAction,
  error,
  initialBusinessName,
  initialMenus,
  message,
  uploadMenuAction,
}: DashboardAppProps) {
  const menus = initialMenus;
  const restaurantName = initialBusinessName || initialMenus[0]?.restaurantName || "";
  const [menuTitle, setMenuTitle] = useState("Product Catalog");
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
  const notice = localMessage ?? message ?? error;

  function publicUrl(slug: string, documentSlug: string) {
    return `${window.location.origin}/menu/${slug}/${documentSlug}`;
  }

  async function copyUrl(slug: string, documentSlug: string) {
    await navigator.clipboard.writeText(publicUrl(slug, documentSlug));
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
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setLocalMessage("Only PDF files are accepted.");
      return;
    }

    if (file.size > uploadConfig.maxPdfBytes) {
      setLocalMessage(`PDF is too large. Limit is ${formatBytes(uploadConfig.maxPdfBytes)}.`);
      return;
    }

    setLocalMessage("PDF ready to upload.");
  }

  return (
    <main className="h-screen overflow-hidden bg-[var(--cream)] text-[var(--charcoal)]">
      <div className="grid h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden h-screen overflow-hidden border-r border-[#e4dbce] bg-[#fffdf8]/86 p-5 backdrop-blur lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--charcoal)] text-white">
              <Sparkles size={19} />
            </div>
            <div>
              <p className="font-semibold tracking-tight">DocLume</p>
              <p className="text-xs font-medium text-[#73766e]">Document OS</p>
            </div>
          </div>

          <nav className="mt-9 space-y-1">
            {navItems.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold transition ${
                  index === 0
                    ? "bg-[var(--charcoal)] text-white shadow-[0_14px_30px_rgba(31,33,29,0.16)]"
                    : "text-[#666a61] hover:bg-[#f3ede3] hover:text-[var(--charcoal)]"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-3xl border border-[#e4dbce] bg-[#f8f3eb] p-4">
            <p className="text-sm font-semibold">Storage status</p>
            <p className="mt-2 text-sm leading-6 text-[#666a61]">
              Files stored in {uploadConfig.storageProvider} bucket {uploadConfig.bucket}.
            </p>
          </div>
        </aside>

        <section className="h-screen min-h-0 overflow-y-auto">
          <header className="sticky top-0 z-30 border-b border-[#e4dbce] bg-[#f7f3eb]/88 px-4 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--green)]">
                  Document workspace
                </p>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {restaurantName}
                </h1>
              </div>
              <a
                href="/auth/logout"
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#d9d0c2] bg-white/70 px-4 text-sm font-semibold text-[#4d5149] transition hover:-translate-y-0.5 hover:bg-white"
              >
                <LogOut size={16} />
                Logout
              </a>
            </div>
          </header>

          <div className="px-4 py-6 md:px-8 md:py-8">
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
                    className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-[var(--shadow-card)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--green-soft)] text-[var(--green)]">
                        <Upload size={21} />
                      </div>
                      <div>
                        <h2 className="font-semibold">Upload PDF document</h2>
                        <p className="text-sm text-[#666a61]">
                          Limit {formatBytes(uploadConfig.maxPdfBytes)}
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
                        className="mt-2 min-h-12 w-full rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15"
                        required
                      />
                    </label>

                    <label
                      onDragEnter={() => setIsDragging(true)}
                      onDragLeave={() => setIsDragging(false)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        setIsDragging(false);
                        const file = event.dataTransfer.files?.[0] ?? null;
                        if (fileRef.current && event.dataTransfer.files.length) {
                          fileRef.current.files = event.dataTransfer.files;
                        }
                        handleFile(file);
                      }}
                      className={`mt-5 flex min-h-[170px] flex-col items-center justify-center rounded-3xl border border-dashed p-5 text-center transition ${
                        isDragging
                          ? "border-[var(--green)] bg-[#eef6ed]"
                          : "border-[#d3c8b8] bg-[#fbf7ef]"
                      }`}
                    >
                      <input
                        ref={fileRef}
                        name="pdf"
                        type="file"
                        accept="application/pdf,.pdf"
                        className="sr-only"
                        required
                        onChange={(event) =>
                          handleFile(event.target.files?.[0] ?? null)
                        }
                      />
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--green)] shadow-sm">
                        <FileText size={22} />
                      </div>
                      <p className="mt-4 text-sm font-semibold">
                        Drop PDF here or tap to browse
                      </p>
                      <p className="mt-1 text-xs text-[#777a72]">
                        PDF only. Pages render in the public showcase viewer.
                      </p>
                      {selectedFile ? (
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
                      className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)]"
                      pendingText="Uploading"
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
                      {notice ? (
                        <p
                          className={`rounded-2xl border px-3 py-2 text-sm font-medium ${
                            error && !localMessage
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-[#cfe1cf] bg-[#eef6ed] text-[var(--green-dark)]"
                          }`}
                        >
                          {notice}
                        </p>
                      ) : (
                        <p className="rounded-2xl border border-[#e4dbce] bg-[#fbf7ef] px-3 py-2 text-sm font-medium text-[#666a61]">
                          Document URLs synced with Supabase.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-[#ece4d8]">
                    {menus.length === 0 ? (
                      <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#f3ede3]">
                          <FileText size={24} />
                        </div>
                        <h3 className="mt-5 text-lg font-semibold">No documents yet</h3>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-[#666a61]">
                          Upload a PDF to create the first public showcase and QR code.
                        </p>
                      </div>
                    ) : (
                      menus.map((menu) => (
                        <article
                          key={menu.id}
                          className="grid gap-4 p-5 transition hover:bg-[#fbf7ef] lg:grid-cols-[1fr_auto]"
                        >
                          <div className="flex gap-4">
                            <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#e5dccf] bg-[#f7f1e7] text-[var(--green)]">
                              <FileText size={24} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold">{menu.title}</h3>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#eef6ed] px-2.5 py-1 text-xs font-semibold text-[var(--green-dark)]">
                                  <CheckCircle2 size={13} />
                                  Active
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-[#666a61]">
                                {menu.restaurantName} - /menu/{menu.slug}/{menu.documentSlug}
                              </p>
                              <a
                                href={`/menu/${menu.slug}/${menu.documentSlug}`}
                                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--green)] transition hover:text-[var(--green-dark)]"
                              >
                                <LinkIcon size={15} />
                                Open public document
                              </a>
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
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
