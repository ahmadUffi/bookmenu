import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Printer,
  QrCode,
  Share2,
} from "lucide-react";
import QrCard from "@/components/menu/qr-card";
import { createClient } from "@/lib/supabase/server";

export default async function QrPage() {
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

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select(
      "id, restaurant_name, slug, menus(id, title, pdf_url, thumbnail_url, is_active, created_at)",
    )
    .eq("owner_id", user.id);

  const menus = (restaurants ?? [])
    .flatMap((restaurant) =>
      (restaurant.menus ?? [])
        .filter((menu) => menu.is_active)
        .map((menu) => ({
          id: menu.id,
          restaurantName: restaurant.restaurant_name,
          slug: restaurant.slug,
          title: menu.title,
          createdAt: menu.created_at,
        })),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const menu = menus[0] ?? null;
  const publicUrl = menu ? `/menu/${menu.slug}` : "/dashboard";

  return (
    <main className="min-h-screen bg-[var(--cream)] text-[var(--charcoal)]">
      <header className="border-b border-[#e4dbce] bg-[#fffdf8]/84 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--green)]">QR code page</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Printable table cards
            </h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#d9d0c2] bg-white px-4 text-sm font-semibold transition hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-8 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          {menu ? (
            <QrCard value={publicUrl} filename={`${menu.slug}-qr`} />
          ) : (
            <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm">
              <h2 className="font-semibold">No active menu</h2>
              <p className="mt-2 text-sm leading-6 text-[#666a61]">
                Upload a PDF menu from the dashboard to generate a QR code.
              </p>
            </div>
          )}
          <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm">
            <h2 className="font-semibold">Sharing interface</h2>
            <div className="mt-4 grid gap-2">
              {[
                [Copy, "Copy public link"],
                [Share2, "Share to staff"],
                [Download, "Download PNG"],
              ].map(([Icon, label]) => (
                <button
                  key={label as string}
                  className="inline-flex min-h-11 items-center gap-3 rounded-2xl border border-[#e4dbce] bg-[#fbf7ef] px-4 text-sm font-semibold transition hover:bg-white"
                >
                  <Icon size={17} />
                  {label as string}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="rounded-[2rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-[var(--shadow-card)] md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--green)]">
                Printable layout
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Table QR preview
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#666a61]">
                A clean card restaurant teams can print, laminate, or place into
                table tents.
              </p>
            </div>
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--charcoal)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5">
              <Printer size={17} />
              Print layout
            </button>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[1, 2].map((table) => (
              <article
                key={table}
                className="rounded-[2rem] border border-[#ded5c7] bg-[#fbf7ef] p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--green)]">
                      {menu?.restaurantName ?? "Your restaurant"}
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold">Table {table}</h3>
                  </div>
                  <QrCode size={26} className="text-[var(--green)]" />
                </div>
                <div className="mt-8 rounded-[1.5rem] bg-white p-5 shadow-sm">
                  <div className="mx-auto grid aspect-square max-w-[240px] grid-cols-7 gap-1 rounded-2xl bg-[#fffdf8] p-4">
                    {Array.from({ length: 49 }, (_, index) => (
                      <span
                        key={index}
                        className={`rounded-sm ${
                          index % 2 === 0 || index % 11 === 0
                            ? "bg-[var(--charcoal)]"
                            : "bg-[#f0eadf]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold">
                  <Check size={17} className="text-[var(--green)]" />
                  Scan to open the digital menu
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
