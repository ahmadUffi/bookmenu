import { redirect } from "next/navigation";
import QrPrintStudio from "@/components/menu/qr-print-studio";
import {
  getOwnerRestaurants,
  mapRestaurantMenus,
} from "@/lib/restaurant-documents";
import { createClient } from "@/lib/supabase/server";

export default async function QrPage() {
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

  const { data: restaurants, error: restaurantsError } =
    await getOwnerRestaurants(supabase, user.id);

  if (restaurantsError) {
    throw new Error(restaurantsError.message);
  }

  const menus = mapRestaurantMenus(restaurants).filter((menu) => menu.isActive);

  return <QrPrintStudio menus={menus} />;
}
