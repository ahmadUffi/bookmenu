"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");
}

const adjustSchema = z.object({
  subId: z.string().uuid(),
  days: z.number().int().min(-365).max(365),
});

export async function adjustSubscriptionDays(subId: string, days: number) {
  await requireAdmin();

  const parsed = adjustSchema.safeParse({ subId, days });
  if (!parsed.success) throw new Error("Invalid input");

  const adminDb = createAdminClient();

  const { data: sub } = await adminDb
    .from("subscriptions")
    .select("ended_at")
    .eq("id", subId)
    .single();

  if (!sub?.ended_at) throw new Error("Subscription not found or has no end date");

  const current = new Date(sub.ended_at);
  current.setDate(current.getDate() + days);

  await adminDb
    .from("subscriptions")
    .update({ ended_at: current.toISOString() })
    .eq("id", subId);

  revalidatePath("/admin/subscriptions");
}
