import { redirect } from "next/navigation";
import DashboardApp from "@/components/dashboard/dashboard-app";
import {
  getOwnerRestaurants,
  mapRestaurantMenus,
} from "@/lib/restaurant-documents";
import { createClient } from "@/lib/supabase/server";
import { deleteMenu, uploadMenu } from "./actions";

export default async function DashboardPage(props: PageProps<"/dashboard">) {
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

  const { data: restaurants, error: restaurantsError } =
    await getOwnerRestaurants(supabase, user.id);

  if (restaurantsError) {
    throw new Error(restaurantsError.message);
  }

  if (!restaurants?.length) {
    const onboardingUrl = message
      ? `/onboarding?message=${encodeURIComponent(message)}`
      : "/onboarding";

    redirect(onboardingUrl);
  }

  const menus = mapRestaurantMenus(restaurants);

  const businessName = restaurants?.[0]?.restaurant_name ?? "";
  return (
    <DashboardApp
      deleteMenuAction={deleteMenu}
      initialBusinessName={businessName}
      initialMenus={menus}
      message={message}
      uploadMenuAction={uploadMenu}
      error={error}
    />
  );
}
