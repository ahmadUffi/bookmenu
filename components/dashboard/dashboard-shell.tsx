"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Home,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  Sparkles,
} from "lucide-react";
import { uploadConfig } from "@/lib/config";

type DashboardShellProps = {
  children: ReactNode;
  title: string;
};

const navItems = [
  { key: "overview", label: "Overview", icon: Home, href: "/dashboard" },
  { key: "qr", label: "QR codes", icon: QrCode, href: "/qr" },
  {
    key: "settings",
    label: "Settings",
    icon: Sparkles,
    href: "/dashboard/settings",
  },
  { key: "landing", label: "Landing page", icon: FileText, href: "/" },
] as const;

export default function DashboardShell({
  children,
  title,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("doclume:sidebar-collapsed") === "true";
  });

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("doclume:sidebar-collapsed", String(next));
      return next;
    });
  }

  const active =
    pathname === "/qr"
      ? "qr"
      : pathname.startsWith("/dashboard/settings")
        ? "settings"
        : "overview";
  const eyebrow = active === "qr" ? "QR print studio" : "Document workspace";

  return (
    <main className="dashboard-shell-root h-screen overflow-hidden bg-[var(--cream)] text-[var(--charcoal)]">
      <div
        className={`dashboard-shell-grid grid h-screen transition-[grid-template-columns] duration-200 ${
          collapsed ? "lg:grid-cols-[88px_1fr]" : "lg:grid-cols-[280px_1fr]"
        }`}
      >
        <aside className="qr-print-hide hidden h-screen overflow-hidden border-r border-[#e4dbce] bg-[#fffdf8]/86 p-5 backdrop-blur lg:block">
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--charcoal)] text-white">
              <Sparkles size={19} />
            </div>
            {collapsed ? null : (
              <div className="min-w-0">
                <p className="truncate font-semibold tracking-tight">DocLume</p>
                <p className="truncate text-xs font-medium text-[#73766e]">
                  Document OS
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleCollapsed}
            className={`mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-[#d9d0c2] bg-white text-sm font-semibold text-[#4d5149] transition hover:bg-[#fbf7ef] ${
              collapsed ? "w-full px-0" : "w-full px-3"
            }`}
            title={collapsed ? "Expand sidebar" : "Minimize sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <PanelLeftClose size={17} />
            )}
            {collapsed ? null : "Minimize"}
          </button>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === active;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex min-h-11 w-full items-center rounded-2xl text-left text-sm font-semibold transition ${
                    collapsed ? "justify-center px-0" : "gap-3 px-3"
                  } ${
                    isActive
                      ? "bg-[var(--charcoal)] text-white shadow-[0_14px_30px_rgba(31,33,29,0.16)]"
                      : "text-[#666a61] hover:bg-[#f3ede3] hover:text-[var(--charcoal)]"
                  }`}
                >
                  <Icon size={18} />
                  {collapsed ? null : item.label}
                </Link>
              );
            })}
          </nav>

          {collapsed ? null : (
            <div className="mt-8 rounded-3xl border border-[#e4dbce] bg-[#f8f3eb] p-4">
              <p className="text-sm font-semibold">Storage status</p>
              <p className="mt-2 text-sm leading-6 text-[#666a61]">
                Files stored in {uploadConfig.storageProvider} bucket{" "}
                {uploadConfig.bucket}.
              </p>
            </div>
          )}
        </aside>

        <section className="dashboard-shell-content h-screen min-h-0 overflow-y-auto">
          <header className="qr-print-hide sticky top-0 z-30 border-b border-[#e4dbce] bg-[#f7f3eb]/88 px-4 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--green)]">
                  {eyebrow}
                </p>
                <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
                  {title}
                </h1>
              </div>
              <a
                href="/auth/logout"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border border-[#d9d0c2] bg-white/70 px-4 text-sm font-semibold text-[#4d5149] transition hover:-translate-y-0.5 hover:bg-white"
              >
                <LogOut size={16} />
                Logout
              </a>
            </div>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
