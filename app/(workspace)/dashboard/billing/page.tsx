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

  const nowStr = new Date().toISOString();
  // 1. Fetch all subscriptions from Supabase to find active ones and history
  const { data: rawHistory } = await supabase
    .from("subscriptions")
    .select("id, created_at, plan, price, ended_at, qrisly_response")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Find the active subscription: ended_at > now() and paid/promo
  const activeSub = (rawHistory ?? []).find(sub => {
    if (sub.ended_at && new Date(sub.ended_at) <= new Date()) return false;
    if (sub.price === 0) return true;
    const responseStatus = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
      ? (sub.qrisly_response as any).status
      : null;
    return ["success", "settlement", "paid", "Success", "SUCCESS"].includes(responseStatus);
  });

  const activePlan = activeSub ? (activeSub.plan as "monthly" | "yearly") : "free";
  const endedAt = activeSub?.ended_at
    ? new Date(activeSub.ended_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const transactions = (rawHistory ?? []).map((sub) => {
    const dateStr = new Date(sub.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const formattedPrice = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
    }).format(sub.price);

    const year = new Date(sub.created_at).getFullYear();
    const invoiceNo = `INV-${year}-${sub.id.substring(0, 8).toUpperCase()}`;

    let status: "Paid" | "Pending" | "Failed" = "Failed";
    if (sub.price === 0) {
      status = "Paid";
    } else {
      const responseStatus = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
        ? (sub.qrisly_response as any).status
        : null;
      if (["success", "settlement", "paid", "Success", "SUCCESS"].includes(responseStatus)) {
        status = "Paid";
      } else if (responseStatus === "pending" || !responseStatus) {
        status = "Pending";
      }
    }

    return {
      id: sub.id,
      date: dateStr,
      invoiceNo,
      planName: `${sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)} Plan`,
      amount: formattedPrice,
      status,
    };
  });

  const isPromoEligible = !(rawHistory ?? []).some(sub => {
    if (sub.price === 0) return true;
    const responseStatus = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
      ? (sub.qrisly_response as any).status
      : null;
    return ["success", "settlement", "paid", "Success", "SUCCESS"].includes(responseStatus);
  });

  return (
    <BillingPanel
      initialBusinessName={restaurant.restaurant_name}
      initialMenus={menus}
      activePlan={activePlan}
      endedAt={endedAt}
      transactions={transactions}
      isPromoEligible={isPromoEligible}
    />
  );
}
