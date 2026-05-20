import { notFound } from "next/navigation";
import FlipbookViewer from "@/components/menu/flipbook-viewer";
import { getDocumentSlug } from "@/lib/document-slug";
import type { MenuRecord } from "@/lib/menu-types";
import { getPublicRestaurant } from "@/lib/restaurant-documents";
import { createClient } from "@/lib/supabase/server";

export default async function PublicDocumentPage(
  props: PageProps<"/menu/[slug]/[documentSlug]">,
) {
  const { slug, documentSlug } = await props.params;
  const supabase = await createClient();

  if (!supabase) {
    notFound();
  }

  const { data: restaurant, error } = await getPublicRestaurant(supabase, slug);

  if (error) {
    notFound();
  }

  const activeMenu = (restaurant?.menus ?? []).find(
    (menu) => menu.is_active && getDocumentSlug(menu) === documentSlug,
  );

  if (!restaurant || !activeMenu) {
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
      <section className="mx-auto h-full w-full max-w-7xl">
        <FlipbookViewer pdfUrl={menu.pdfUrl} />
      </section>
    </main>
  );
}
