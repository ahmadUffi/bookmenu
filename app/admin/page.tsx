import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MoreHorizontal,
  Search,
  ShieldCheck,
  FileText,
  UploadCloud,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, restaurant_name, slug, menus(id, is_active)");

  const rows = (restaurants ?? []).map((restaurant) => {
    const menus = restaurant.menus ?? [];
    const activeMenus = menus.filter((menu) => menu.is_active).length;

    return {
      id: restaurant.id,
      name: restaurant.restaurant_name,
      slug: restaurant.slug,
      status: activeMenus > 0 ? "Active" : "No active document",
      menuCount: menus.length,
    };
  });

  const activeMenuCount = rows.reduce((count, row) => count + row.menuCount, 0);

  return (
    <main className="min-h-screen bg-[var(--cream)] text-[var(--charcoal)]">
      <header className="border-b border-[#e4dbce] bg-[#fffdf8]/84 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--green)]">Admin dashboard</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Workspace management
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#d9d0c2] bg-white px-4 text-sm font-semibold transition hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Workspaces", rows.length.toString(), FileText],
            ["Documents", activeMenuCount.toString(), UploadCloud],
            ["Owners", rows.length.toString(), Users],
            ["Moderation", "0", ShieldCheck],
          ].map(([label, value, Icon]) => (
            <div
              key={label as string}
              className="rounded-3xl border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#666a61]">{label as string}</p>
                <Icon className="text-[var(--green)]" size={21} />
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-tight">{value as string}</p>
            </div>
          ))}
        </div>

        <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] shadow-[var(--shadow-card)]">
          <div className="border-b border-[#e4dbce] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Document moderation
                </h2>
                <p className="mt-1 text-sm text-[#666a61]">
                  Review workspace profiles, document status, and scan health.
                </p>
              </div>
              <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 text-sm font-semibold text-[#666a61]">
                <Search size={17} />
                <input
                  className="w-full bg-transparent outline-none placeholder:text-[#8a8d84]"
                  placeholder="Search workspaces"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#fbf7ef] text-xs uppercase tracking-[0.14em] text-[#777a72]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Workspace</th>
                  <th className="px-5 py-4 font-semibold">Slug</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Documents</th>
                  <th className="px-5 py-4 font-semibold">Analytics</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece4d8]">
                {rows.map((restaurant) => (
                  <tr key={restaurant.id} className="transition hover:bg-[#fbf7ef]">
                    <td className="px-5 py-4 font-semibold">{restaurant.name}</td>
                    <td className="px-5 py-4 text-[#666a61]">/{restaurant.slug}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          restaurant.status === "Active"
                            ? "bg-[#eef6ed] text-[var(--green-dark)]"
                            : "bg-[#fff5df] text-[#8a6116]"
                        }`}
                      >
                        <CheckCircle2 size={13} />
                        {restaurant.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#666a61]">
                      {restaurant.menuCount} document{restaurant.menuCount === 1 ? "" : "s"}
                    </td>
                    <td className="px-5 py-4 text-[#666a61]">Not tracked</td>
                    <td className="px-5 py-4">
                      <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9d0c2] bg-white transition hover:bg-[#fbf7ef]" aria-label={`Actions for ${restaurant.name}`}>
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
