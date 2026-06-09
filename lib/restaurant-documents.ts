import { getDocumentSlug } from "./document-slug";
import type { MenuRecord } from "./menu-types";

type SupabaseClient = NonNullable<
  Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>
>;

type RestaurantRow = {
  id: string;
  owner_id: string;
  restaurant_name: string;
  slug: string;
  menus?: MenuRow[] | null;
};

type MenuRow = {
  id: string;
  title: string;
  document_slug?: string | null;
  pdf_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
};

const withDocumentSlugSelect =
  "id, owner_id, restaurant_name, slug, menus(id, title, document_slug, pdf_url, thumbnail_url, is_active, created_at)";

const legacySelect =
  "id, owner_id, restaurant_name, slug, menus(id, title, pdf_url, thumbnail_url, is_active, created_at)";

function sortMenus(menus: MenuRecord[]) {
  return menus.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function mapRestaurantMenus(restaurants: RestaurantRow[] | null) {
  return sortMenus(
    (restaurants ?? []).flatMap((restaurant) =>
      (restaurant.menus ?? []).map((menu) => ({
        id: menu.id,
        restaurantId: restaurant.id,
        restaurantName: restaurant.restaurant_name,
        slug: restaurant.slug,
        documentSlug: getDocumentSlug(menu),
        title: menu.title,
        pdfUrl: menu.pdf_url,
        thumbnailUrl: menu.thumbnail_url,
        isActive: menu.is_active,
        createdAt: menu.created_at,
      })),
    ),
  );
}

export async function getOwnerRestaurants(supabase: SupabaseClient, userId: string) {
  const query = () =>
    supabase
      .from("restaurants")
      .select(withDocumentSlugSelect)
      .eq("owner_id", userId);

  const result = await query();

  if (!result.error) {
    return { data: result.data as RestaurantRow[] | null, error: null };
  }

  const legacyResult = await supabase
    .from("restaurants")
    .select(legacySelect)
    .eq("owner_id", userId);

  return {
    data: legacyResult.data as RestaurantRow[] | null,
    error: legacyResult.error,
  };
}

export async function getOwnerRestaurant(supabase: SupabaseClient, userId: string) {
  const result = await supabase
    .from("restaurants")
    .select(
      "id, owner_id, restaurant_name, logo_url, slug, menus(id, title, document_slug, pdf_url, thumbnail_url, is_active, created_at)",
    )
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!result.error) {
    return { data: result.data as (RestaurantRow & { logo_url: string | null }) | null, error: null };
  }

  const legacyResult = await supabase
    .from("restaurants")
    .select(
      "id, owner_id, restaurant_name, logo_url, slug, menus(id, title, pdf_url, thumbnail_url, is_active, created_at)",
    )
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    data: legacyResult.data as (RestaurantRow & { logo_url: string | null }) | null,
    error: legacyResult.error,
  };
}

export async function getPublicRestaurant(supabase: SupabaseClient, slug: string) {
  const result = await supabase
    .from("restaurants")
    .select(withDocumentSlugSelect)
    .eq("slug", slug)
    .single();

  if (!result.error) {
    return { data: result.data as RestaurantRow | null, error: null };
  }

  const legacyResult = await supabase
    .from("restaurants")
    .select(legacySelect)
    .eq("slug", slug)
    .single();

  return {
    data: legacyResult.data as RestaurantRow | null,
    error: legacyResult.error,
  };
}
