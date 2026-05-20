import { notFound } from "next/navigation";
import FlipbookViewer from "@/components/menu/flipbook-viewer";
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
  return (
    <main className="h-[100dvh] overflow-hidden bg-white px-2 py-0 sm:px-4 sm:py-4 md:h-auto md:min-h-screen md:overflow-visible">
      <section className="mx-auto h-full w-full max-w-7xl">
        <FlipbookViewer pdfUrl={menu.pdfUrl} />
      </section>
    </main>
  );
}
