"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  FileCheck2,
  FileText,
  Home,
  LogOut,
  QrCode,
  Sparkles,
  Upload,
} from "lucide-react";
import { formatBytes, logoUploadConfig, uploadConfig } from "@/lib/config";
import type { MenuRecord } from "@/lib/menu-types";
import PendingSubmitButton from "@/components/ui/pending-submit-button";

type SettingsPanelProps = {
  error: string | null;
  initialBusinessName: string;
  initialLogoUrl: string;
  message: string | null;
  initialMenus: MenuRecord[];
  updateBusinessSettingsAction: (formData: FormData) => void;
};

export default function SettingsPanel({
  error,
  initialBusinessName,
  initialLogoUrl,
  message,
  initialMenus,
  updateBusinessSettingsAction,
}: SettingsPanelProps) {
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(initialLogoUrl);
  const notice = message ?? error;
  const activeMenus = initialMenus.filter((menu) => menu.isActive);
  const restaurantCount = new Set(initialMenus.map((menu) => menu.restaurantId)).size;

  function handleLogoChange(file: File | null) {
    setSelectedLogoFile(file);
    if (!file) {
      setLogoPreviewUrl(initialLogoUrl);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogoPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
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
            <Link
              href="/dashboard"
              className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-[#666a61] transition hover:bg-[#f3ede3] hover:text-[var(--charcoal)]"
            >
              <Home size={18} />
              Overview
            </Link>
            <Link
              href="/qr"
              className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-[#666a61] transition hover:bg-[#f3ede3] hover:text-[var(--charcoal)]"
            >
              <QrCode size={18} />
              QR codes
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex min-h-11 w-full items-center gap-3 rounded-2xl bg-[var(--charcoal)] px-3 text-left text-sm font-semibold text-white shadow-[0_14px_30px_rgba(31,33,29,0.16)]"
            >
              <Sparkles size={18} />
              Settings
            </Link>
            <Link
              href="/"
              className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-[#666a61] transition hover:bg-[#f3ede3] hover:text-[var(--charcoal)]"
            >
              <FileText size={18} />
              Landing page
            </Link>
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
                  {initialBusinessName}
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
            {notice ? (
              <p className="mb-4 rounded-2xl border border-[#cfe1cf] bg-[#eef6ed] px-3 py-2 text-sm font-medium text-[var(--green-dark)]">
                {notice}
              </p>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Active documents", activeMenus.length.toString(), FileCheck2],
                ["Workspaces", restaurantCount.toString(), QrCode],
                ["Published links", initialMenus.length.toString(), BarChart3],
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

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
              <form
                action={updateBusinessSettingsAction}
                encType="multipart/form-data"
                className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Business profile
                    </h2>
                    <p className="mt-1 text-sm text-[#666a61]">
                      Edit the workspace name and logo shown across the app.
                    </p>
                  </div>
                  <div className="hidden h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#e4dbce] bg-[#fbf7ef] md:flex">
                    {logoPreviewUrl ? (
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${logoPreviewUrl})` }}
                        aria-label="Workspace logo"
                      />
                    ) : (
                      <Sparkles size={20} className="text-[var(--green)]" />
                    )}
                  </div>
                </div>

                <label className="mt-6 block text-sm font-semibold">
                  Workspace name
                  <input
                    name="businessName"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder="Acme Studio"
                    className="mt-2 min-h-12 w-full rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15"
                    required
                  />
                </label>

                <label className="mt-4 block text-sm font-semibold">
                  Upload logo
                  <input
                    name="logo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) =>
                      handleLogoChange(event.target.files?.[0] ?? null)
                    }
                    className="mt-2 block w-full cursor-pointer rounded-2xl border border-dashed border-[#d3c8b8] bg-[#fbf7ef] px-4 py-3 text-sm text-[#666a61] file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--charcoal)]"
                  />
                </label>

                <div className="mt-4 rounded-2xl border border-[#e1d8ca] bg-[#fbf7ef] p-4">
                  <p className="text-sm font-semibold">Logo preview</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#e4dbce] bg-white">
                      {logoPreviewUrl ? (
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${logoPreviewUrl})` }}
                          aria-label="Selected logo preview"
                        />
                      ) : (
                        <Sparkles size={18} className="text-[var(--green)]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {selectedLogoFile?.name ?? "Current logo"}
                      </p>
                      <p className="text-xs text-[#777a72]">
                        PNG, JPG, or WEBP. Max{" "}
                        {formatBytes(logoUploadConfig.maxImageBytes)}.
                      </p>
                    </div>
                  </div>
                </div>

                <PendingSubmitButton
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)]"
                  pendingText="Saving"
                >
                  <Upload size={17} />
                  Save settings
                </PendingSubmitButton>
              </form>

              <section className="space-y-5">
                <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm">
                  <h3 className="font-semibold">Billing & subscription</h3>
                  <p className="mt-2 text-sm leading-6 text-[#666a61]">
                    This area is reserved for plan management, invoices, and
                    future subscription controls.
                  </p>
                  <div className="mt-4 rounded-2xl border border-[#e4dbce] bg-[#fbf7ef] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#777a72]">
                      Current plan
                    </p>
                    <p className="mt-2 text-lg font-semibold">Starter</p>
                    <p className="mt-1 text-sm text-[#666a61]">
                      Perfect for getting the first document live. Billing upgrades can
                      be connected here later.
                    </p>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#eef6ed] px-3 py-2 text-sm font-semibold text-[var(--green-dark)]">
                    <CheckCircle2 size={14} />
                    Same dashboard shell as overview
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm">
                  <h2 className="font-semibold">Quick links</h2>
                  <div className="mt-4 space-y-2">
                    <a
                      href="/dashboard"
                      className="flex min-h-11 items-center gap-2 rounded-2xl border border-[#d9d0c2] bg-[#fbf7ef] px-4 text-sm font-semibold transition hover:bg-white"
                    >
                      <FileCheck2 size={16} />
                      Back to overview
                    </a>
                    <a
                      href="/qr"
                      className="flex min-h-11 items-center gap-2 rounded-2xl border border-[#d9d0c2] bg-[#fbf7ef] px-4 text-sm font-semibold transition hover:bg-white"
                    >
                      <QrCode size={16} />
                      Open QR page
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
