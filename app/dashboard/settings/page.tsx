import { redirect } from "next/navigation";
import SettingsPanel from "@/components/dashboard/settings-panel";
import type { MenuRecord } from "@/lib/menu-types";
import { createClient } from "@/lib/supabase/server";
import { updateBusinessSettings } from "../actions";

export default async function DashboardSettingsPage(
  props: PageProps<"/dashboard/settings">,
) {
  const searchParams = await props.searchParams;
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

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  const message =
    typeof searchParams.message === "string" ? searchParams.message : null;
  const error = typeof searchParams.error === "string" ? searchParams.error : null;

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, restaurant_name, logo_url, slug, menus(id, title, pdf_url, thumbnail_url, is_active, created_at)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!restaurant) {
    redirect("/onboarding");
  }

  const menus: MenuRecord[] = (restaurant.menus ?? [])
    .map((menu) => ({
      id: menu.id,
      restaurantId: restaurant.id,
      restaurantName: restaurant.restaurant_name,
      slug: restaurant.slug,
      title: menu.title,
      pdfUrl: menu.pdf_url,
      thumbnailUrl: menu.thumbnail_url,
      isActive: menu.is_active,
      createdAt: menu.created_at,
    }))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <SettingsPanel
      error={error}
      initialBusinessName={restaurant.restaurant_name}
      initialLogoUrl={restaurant.logo_url ?? ""}
      initialMenus={menus}
      message={message}
      updateBusinessSettingsAction={updateBusinessSettings}
    />
  );
}
