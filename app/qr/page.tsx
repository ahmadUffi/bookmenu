import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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

  return (
    <main className="min-h-screen bg-[var(--cream)] text-[var(--charcoal)]">
      <header className="qr-print-hide border-b border-[#e4dbce] bg-[#fffdf8]/84 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--green)]">QR print studio</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Printable A4 QR sheets
            </h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#d9d0c2] bg-white px-4 text-sm font-semibold transition hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </header>

      <QrPrintStudio menus={menus} />
    </main>
  );
}
