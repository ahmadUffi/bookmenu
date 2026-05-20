import { redirect } from "next/navigation";
import SettingsPanel from "@/components/dashboard/settings-panel";
import { getOwnerRestaurant, mapRestaurantMenus } from "@/lib/restaurant-documents";
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

  const { data: restaurant, error: restaurantError } = await getOwnerRestaurant(
    supabase,
    user.id,
  );

  if (restaurantError) {
    throw new Error(restaurantError.message);
  }

  if (!restaurant) {
    redirect("/onboarding");
  }

  const menus = mapRestaurantMenus([restaurant]);

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
