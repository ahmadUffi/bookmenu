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

  const now = new Date();
  // 1. Fetch all subscriptions from Supabase to find active ones and history
  const { data: rawHistory } = await supabase
    .from("subscriptions")
    .select("id, created_at, plan, price, started_at, ended_at, qrisly_response")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Find all active/paid/promo subscriptions for the user that have ended_at in the future
  const activeSubs = (rawHistory ?? []).filter(sub => {
    if (sub.ended_at && new Date(sub.ended_at) <= now) return false;
    if (sub.price === 0) return true;
    const responseStatus = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
      ? String((sub.qrisly_response as any).status).toLowerCase()
      : null;
    return responseStatus === "success" || responseStatus === "paid";
  });

  // Determine currently running subscription (started_at <= now <= ended_at)
  const currentlyRunningSub = activeSubs.find(sub => {
    const start = new Date(sub.started_at || sub.created_at);
    const end = sub.ended_at ? new Date(sub.ended_at) : null;
    return start <= now && (!end || end > now);
  });

  // If none covers now, fallback to the latest active subscription (if any)
  const activeSub = currentlyRunningSub || activeSubs[0];

  const activePlan = activeSub ? (activeSub.plan as "monthly" | "yearly") : "free";

  // Calculate the overall ended_at of the entire active subscription chain (the max ended_at)
  let endedAt: string | null = null;
  if (activeSubs.length > 0) {
    const endDates = activeSubs
      .map(sub => sub.ended_at ? new Date(sub.ended_at).getTime() : 0)
      .filter(time => time > 0);
    if (endDates.length > 0) {
      endedAt = new Date(Math.max(...endDates)).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  // Map the active subscription chain
  const activeChain = activeSubs.map(sub => ({
    id: sub.id,
    plan: sub.plan,
    startedAt: sub.started_at || sub.created_at,
    endedAt: sub.ended_at,
  }));

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
        ? String((sub.qrisly_response as any).status).toLowerCase()
        : null;
      if (responseStatus === "success" || responseStatus === "paid") {
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
      ? String((sub.qrisly_response as any).status).toLowerCase()
      : null;
    return responseStatus === "success" || responseStatus === "paid";
  });

  return (
    <BillingPanel
      initialBusinessName={restaurant.restaurant_name}
      initialMenus={menus}
      activePlan={activePlan}
      endedAt={endedAt}
      transactions={transactions}
      isPromoEligible={isPromoEligible}
      activeChain={activeChain}
    />
  );
}
