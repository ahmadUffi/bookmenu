import { notFound, redirect } from "next/navigation";
import { getDocumentSlug } from "@/lib/document-slug";
import { getPublicRestaurant } from "@/lib/restaurant-documents";
import { createClient } from "@/lib/supabase/server";

export default async function PublicMenuPage(props: PageProps<"/menu/[slug]">) {
  const { slug } = await props.params;
  const supabase = await createClient();

  if (!supabase) {
    notFound();
  }

  const { data: restaurant, error } = await getPublicRestaurant(supabase, slug);

  if (error) {
    notFound();
  }

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

  redirect(`/menu/${restaurant.slug}/${getDocumentSlug(activeMenu)}`);
}
