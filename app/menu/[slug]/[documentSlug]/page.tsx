import { notFound } from "next/navigation";
import FlipbookViewer from "@/components/menu/flipbook-viewer";
import { getDocumentSlug } from "@/lib/document-slug";
import type { MenuRecord } from "@/lib/menu-types";
import { getPublicRestaurant } from "@/lib/restaurant-documents";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
    <main className="h-[100dvh] overflow-hidden bg-white px-2 py-0 sm:px-4 sm:py-4 md:h-auto md:min-h-screen md:overflow-visible">
      <section className="mx-auto h-full w-full ">
        <FlipbookViewer pdfUrl={menu.pdfUrl} />
      </section>
    </main>
  );
}
