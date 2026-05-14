import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChefHat, Copy, Share2 } from "lucide-react";
import FlipbookViewer from "@/components/menu/flipbook-viewer";
import QrCard from "@/components/menu/qr-card";
import type { MenuRecord } from "@/lib/menu-types";
import { createClient } from "@/lib/supabase/server";

export default async function PublicMenuPage(props: PageProps<"/menu/[slug]">) {
  const { slug } = await props.params;
  const supabase = await createClient();

  if (!supabase) {
    notFound();
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select(
      "id, restaurant_name, slug, menus(id, title, pdf_url, thumbnail_url, is_active, created_at)",
    )
    .eq("slug", slug)
    .single();

  const activeMenus = (restaurant?.menus ?? [])
    .filter((menu) => menu.is_active)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  const activeMenu = activeMenus[0];

  if (!restaurant || !activeMenu) {
    notFound();
  }

  const menu: MenuRecord = {
    id: activeMenu.id,
    restaurantId: restaurant.id,
    restaurantName: restaurant.restaurant_name,
    slug: restaurant.slug,
    title: activeMenu.title,
    pdfUrl: activeMenu.pdf_url,
    thumbnailUrl: activeMenu.thumbnail_url,
    isActive: activeMenu.is_active,
    createdAt: activeMenu.created_at,
  };
  const publicUrl = `/menu/${menu.slug}`;

  return (
    <main className="min-h-screen bg-[var(--cream)] text-[var(--charcoal)]">
      <header className="sticky top-0 z-40 border-b border-[#e4dbce] bg-[#f7f3eb]/88 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--charcoal)] text-white sm:flex">
              <ChefHat size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--green)]">
                {menu.restaurantName}
              </p>
              <h1 className="truncate text-xl font-semibold tracking-tight md:text-2xl">
                {menu.title}
              </h1>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#d9d0c2] bg-white/80 px-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-8 lg:grid-cols-[1fr_300px]">
        <section>
          <FlipbookViewer pdfUrl={menu.pdfUrl} title={menu.title} />
        </section>
        <aside className="space-y-4">
          <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-[var(--shadow-card)]">
            <p className="text-sm font-semibold text-[var(--green)]">
              Restaurant branding
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {menu.restaurantName}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#666a61]">
              Browse the digital menu in fullscreen, swipe between pages on
              mobile, or share this public menu link.
            </p>
            <div className="mt-5 flex gap-2">
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d9d0c2] bg-[#fbf7ef] transition hover:bg-white" aria-label="Copy public link">
                <Copy size={17} />
              </button>
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d9d0c2] bg-[#fbf7ef] transition hover:bg-white" aria-label="Share menu">
                <Share2 size={17} />
              </button>
            </div>
          </div>
          <QrCard value={publicUrl} filename={`${menu.slug}-qr`} />
          <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 text-sm leading-6 text-[#666a61] shadow-sm">
            <h2 className="font-semibold text-[var(--charcoal)]">Public menu URL</h2>
            <p className="mt-2 break-all">{publicUrl}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
