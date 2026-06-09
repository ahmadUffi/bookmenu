import { notFound } from "next/navigation";
import FlipbookViewer from "@/components/menu/flipbook-viewer";
import { getDocumentSlug } from "@/lib/document-slug";
import type { MenuRecord } from "@/lib/menu-types";
import { getPublicRestaurant } from "@/lib/restaurant-documents";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookOpen, ExternalLink, FileText } from "lucide-react";

export default async function PublicDocumentPage(
  props: PageProps<"/menu/[slug]/[documentSlug]">,
) {
  const { slug, documentSlug } = await props.params;
  const supabase = await createClient();

  if (!supabase) {
    notFound();
  }

  const { data: restaurant, error } = await getPublicRestaurant(supabase, slug);

  if (error || !restaurant) {
    notFound();
  }

  let plan = "free";
  try {
    const adminDb = createAdminClient();
    const nowStr = new Date().toISOString();
    const { data: activeSub } = await adminDb
      .from("subscriptions")
      .select("plan")
      .eq("user_id", restaurant.owner_id)
      .eq("status", "active")
      .gt("ended_at", nowStr)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (activeSub) {
      plan = activeSub.plan;
    }
  } catch (err) {
    console.error("Error checking subscription status:", err);
  }

  const limit = plan === "free" ? 1 : 5;

  const activeMenusSorted = (restaurant.menus ?? [])
    .filter((menu) => menu.is_active)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  const allowedMenus = activeMenusSorted.slice(0, limit);
  const activeMenu = allowedMenus.find(
    (menu) => getDocumentSlug(menu) === documentSlug,
  );

  if (!activeMenu) {
    notFound();
  }

  const menu: MenuRecord = {
    id: activeMenu.id,
    restaurantId: restaurant.id,
    restaurantName: restaurant.restaurant_name,
    slug: restaurant.slug,
    documentSlug: getDocumentSlug(activeMenu),
    title: activeMenu.title,
    pdfUrl: activeMenu.pdf_url,
    thumbnailUrl: activeMenu.thumbnail_url,
    isActive: activeMenu.is_active,
    createdAt: activeMenu.created_at,
  };

  return (
    <main className="flex h-[100dvh] overflow-hidden bg-[#082f49] p-0 text-[#082f49] md:p-4">
      <section className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden bg-[#f0f9ff] shadow-[0_30px_90px_rgba(0,0,0,0.26)] md:rounded-[2rem] md:border md:border-white/20">
        <header className="flex flex-none items-center justify-between gap-3 border-b border-sky-100 bg-white px-4 py-3 md:px-5 md:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#082f49] text-white sm:flex">
              <BookOpen size={19} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-[#0ea5e9]">
                FlipDulu preview
              </p>
              <h1 className="truncate text-lg font-semibold tracking-tight md:text-2xl">
                {menu.title}
              </h1>
              <p className="hidden truncate text-sm text-slate-500 sm:block">
                {menu.restaurantName}
              </p>
            </div>
          </div>
          <a
            href={menu.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-[#0c4a6e] transition hover:bg-white"
            aria-label="Buka PDF asli"
          >
            <ExternalLink size={18} />
          </a>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 py-2 md:px-5 md:py-5">
          <div className="mb-2 hidden flex-none items-center gap-2 rounded-2xl border border-sky-100 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 md:flex">
            <FileText size={16} className="text-[#0ea5e9]" />
            Geser atau klik sudut halaman untuk membuka flipbook.
          </div>
          <div className="min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-sky-100 bg-white shadow-[0_20px_60px_rgba(12,42,63,0.1)]">
            <FlipbookViewer pdfUrl={menu.pdfUrl} />
          </div>
        </div>
      </section>
    </main>
  );
}
