import { redirect } from "next/navigation";
import BillingPanel from "@/components/dashboard/billing-panel";
import { getOwnerRestaurant, mapRestaurantMenus } from "@/lib/restaurant-documents";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardBillingPage(
  props: PageProps<"/dashboard/billing">,
) {
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
    <BillingPanel
      initialBusinessName={restaurant.restaurant_name}
      initialMenus={menus}
    />
  );
}
