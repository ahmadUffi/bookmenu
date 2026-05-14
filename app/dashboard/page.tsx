import { redirect } from "next/navigation";
import DashboardApp from "@/components/dashboard/dashboard-app";
import type { MenuRecord } from "@/lib/menu-types";
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

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select(
      "id, restaurant_name, slug, menus(id, title, pdf_url, thumbnail_url, is_active, created_at)",
    )
    .eq("owner_id", user.id);

  if (!restaurants?.length) {
    const onboardingUrl = message
      ? `/onboarding?message=${encodeURIComponent(message)}`
      : "/onboarding";

    redirect(onboardingUrl);
  }

  const menus: MenuRecord[] = (restaurants ?? [])
    .flatMap((restaurant) =>
      (restaurant.menus ?? []).map((menu) => ({
        id: menu.id,
        restaurantId: restaurant.id,
        restaurantName: restaurant.restaurant_name,
        slug: restaurant.slug,
        title: menu.title,
        pdfUrl: menu.pdf_url,
        thumbnailUrl: menu.thumbnail_url,
        isActive: menu.is_active,
        createdAt: menu.created_at,
      })),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

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
