import { notFound } from "next/navigation";
import FlipbookViewer from "@/components/menu/flipbook-viewer";
import { getDocumentSlug } from "@/lib/document-slug";
import type { MenuRecord } from "@/lib/menu-types";
import { getPublicRestaurant } from "@/lib/restaurant-documents";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookOpen, ExternalLink, AlertCircle } from "lucide-react";

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
  let isScanLimitExceeded = false;
  let resetDateStr = null;

  try {
    const adminDb = createAdminClient();
    const nowStr = new Date().toISOString();
    const { data: activeSubs } = await adminDb
      .from("subscriptions")
      .select("plan, price, qrisly_response")
      .eq("user_id", restaurant.owner_id)
      .gt("ended_at", nowStr)
      .order("created_at", { ascending: false });

    const activeSub = (activeSubs ?? []).find(sub => {
      if (sub.price === 0) return true;
      const responseStatus = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
        ? String((sub.qrisly_response as { status?: string }).status).toLowerCase()
        : null;
      return responseStatus === "success" || responseStatus === "paid";
    });
    if (activeSub) {
      plan = activeSub.plan;
    }

    // Record the scan event and check limits
    const { data: scanResult, error: scanError } = await adminDb.rpc("track_and_increment_scan", {
      owner_uuid: restaurant.owner_id,
      is_free_plan: plan === "free",
    });

    if (scanError) {
      console.error("Error tracking scan:", scanError);
    } else if (scanResult && scanResult.length > 0) {
      isScanLimitExceeded = !!scanResult[0].res_is_exceeded;
      resetDateStr = scanResult[0].res_last_reset;
    }
  } catch (err) {
    console.error("Error checking subscription status and scans:", err);
  }

  if (isScanLimitExceeded) {
    const nextResetDate = new Date(new Date(resetDateStr || new Date()).getTime() + 30 * 24 * 60 * 60 * 1000);
    const formattedResetDate = nextResetDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <main className="flex h-[100dvh] items-center justify-center bg-[#082f49] p-4 text-white">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0c4a6e] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-3">
            Batas Scan Tercapai
          </h2>
          <p className="text-sm text-sky-200/80 leading-relaxed mb-6">
            Menu QR ini telah mencapai batas maksimal 1.000 scan untuk paket Free. 
            Jika Anda adalah pemilik restoran, silakan masuk ke dashboard dan upgrade paket Anda untuk membuka scan tanpa batas.
          </p>
          <div className="border-t border-sky-800 pt-6">
            <p className="text-xs text-sky-300 font-medium">
              Akan di-reset otomatis pada:
            </p>
            <p className="text-sm font-semibold text-white mt-1">
              {formattedResetDate}
            </p>
          </div>
        </div>
      </main>
    );
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
    <main className="flex h-[100dvh] overflow-hidden bg-[#082f49] p-0 text-[#082f49] md:p-2">
      <section className="mx-auto flex h-full w-full max-w-[1800px] flex-col overflow-hidden bg-[#f0f9ff] shadow-[0_30px_90px_rgba(0,0,0,0.26)] md:rounded-[1.5rem] md:border md:border-white/20">
        <header className="flex flex-none items-center justify-between gap-3 border-b border-sky-100 bg-white px-4 py-3 md:px-4 md:py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#082f49] text-white sm:flex">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-[#0ea5e9]">
                FlipDulu
              </p>
              <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">
                {menu.title}
              </h1>
            </div>
          </div>
          <a
            href={menu.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-[#0c4a6e] transition hover:bg-white"
            aria-label="Buka PDF asli"
          >
            <ExternalLink size={18} />
          </a>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-1 md:p-3">
          <div className="min-h-0 flex-1 overflow-hidden rounded-[1.25rem] border border-sky-100 bg-white shadow-[0_18px_50px_rgba(12,42,63,0.09)]">
            <FlipbookViewer pdfUrl={menu.pdfUrl} />
          </div>
        </div>
      </section>
    </main>
  );
}
