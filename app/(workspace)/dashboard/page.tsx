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

  const nowStr = new Date().toISOString();
  const { data: activeSubs } = await supabase
    .from("subscriptions")
    .select("plan, price, qrisly_response")
    .eq("user_id", user.id)
    .gt("ended_at", nowStr)
    .order("created_at", { ascending: false });

  const activeSub = (activeSubs ?? []).find(sub => {
    if (sub.price === 0) return true;
    const responseStatus = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
      ? String((sub.qrisly_response as any).status).toLowerCase()
      : null;
    return responseStatus === "paid";
  });

  const plan = activeSub?.plan || "free";

  const businessName = restaurants?.[0]?.restaurant_name ?? "";
  return (
    <DashboardApp
      deleteMenuAction={deleteMenu}
      initialBusinessName={businessName}
      initialMenus={menus}
      message={message}
      uploadMenuAction={uploadMenu}
      error={error}
      plan={plan}
    />
  );
}
