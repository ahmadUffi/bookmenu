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
      ? String((sub.qrisly_response as { status?: string }).status).toLowerCase()
      : null;
    return responseStatus === "success" || responseStatus === "paid";
  });

  const plan = activeSub?.plan || "free";

  let scansUsed = 0;
  try {
    const { data: usageData, error: usageError } = await supabase.rpc("get_or_create_usage", {
      owner_uuid: user.id,
      is_free_plan: plan === "free",
    });

    if (usageError) {
      console.error("Error fetching usage for dashboard:", usageError);
    } else if (usageData && usageData.length > 0) {
      scansUsed = usageData[0].res_qr_scan;
    }
  } catch (err) {
    console.error("Error retrieving dashboard usage:", err);
  }

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
      scansUsed={scansUsed}
    />
  );
}
