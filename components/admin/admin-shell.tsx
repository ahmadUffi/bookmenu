"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

type AdminShellProps = { children: ReactNode };

const navItems = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { key: "users", label: "Users", icon: Users, href: "/admin/users" },
  { key: "workspaces", label: "Workspaces", icon: Building2, href: "/admin/workspaces" },
  { key: "subscriptions", label: "Subscriptions", icon: CreditCard, href: "/admin/subscriptions" },
  { key: "revenue", label: "Revenue", icon: TrendingUp, href: "/admin/revenue" },
  { key: "analytics", label: "Analytics", icon: BarChart2, href: "/admin/analytics" },
] as const;

const pageTitles: Record<string, string> = {
  overview: "Overview",
  users: "Users",
  workspaces: "Workspaces",
  subscriptions: "Subscriptions",
  revenue: "Revenue",
  analytics: "Analytics",
};

function SidebarContent({
  active,
  collapsed,
  onClose,
  toggleCollapsed,
}: {
  active: string;
  collapsed: boolean;
  onClose?: () => void;
  toggleCollapsed: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={`flex items-center border-b border-slate-800 px-4 py-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 shadow-lg">
            <ShieldCheck size={17} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-white">FlipDulu</p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-red-400/80">Admin</p>
            </div>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={`group flex min-h-10 w-full cursor-pointer items-center rounded-xl text-sm font-medium transition-all duration-150 ${
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${
                isActive
                  ? "bg-red-500/15 text-red-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon size={17} className={isActive ? "text-red-400" : "text-slate-500 group-hover:text-slate-300"} />
              {!collapsed && item.label}
              {!collapsed && isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-800 px-2 py-3 space-y-0.5">
        <button
          onClick={toggleCollapsed}
          className={`flex min-h-9 w-full cursor-pointer items-center rounded-xl text-xs font-medium text-slate-500 transition hover:bg-white/5 hover:text-slate-300 ${
            collapsed ? "justify-center px-0" : "gap-2.5 px-3"
          }`}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <><PanelLeftClose size={15} /><span className="hidden lg:inline">Collapse</span></>}
        </button>
        <a
          href="/auth/logout"
          className={`flex min-h-9 w-full cursor-pointer items-center rounded-xl text-xs font-medium text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 ${
            collapsed ? "justify-center px-0" : "gap-2.5 px-3"
          }`}
        >
          <LogOut size={15} />
          {!collapsed && "Logout"}
        </a>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("admin:sidebar-collapsed", String(next));
      }
      return next;
    });
  }

  const active =
    pathname === "/admin" ? "overview"
    : pathname.startsWith("/admin/users") ? "users"
    : pathname.startsWith("/admin/workspaces") ? "workspaces"
    : pathname.startsWith("/admin/subscriptions") ? "subscriptions"
    : pathname.startsWith("/admin/revenue") ? "revenue"
    : pathname.startsWith("/admin/analytics") ? "analytics"
    : "overview";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Desktop sidebar — always in document flow */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:shrink-0 lg:h-screen bg-slate-900 border-r border-slate-800 transition-[width] duration-200 overflow-hidden ${
          collapsed ? "lg:w-[72px]" : "lg:w-[240px]"
        }`}
      >
        <SidebarContent
          active={active}
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
        />
      </aside>

      {/* Mobile sidebar — fixed drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 lg:hidden">
            <SidebarContent
              active={active}
              collapsed={false}
              onClose={() => setMobileOpen(false)}
              toggleCollapsed={toggleCollapsed}
            />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-slate-400 hover:text-slate-700 lg:hidden"
            >
              <Menu size={22} />
            </button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-red-500/70">Admin Panel</p>
              <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900">
                {pageTitles[active] ?? "Admin"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-500">Live</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
