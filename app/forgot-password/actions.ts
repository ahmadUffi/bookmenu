"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

async function getOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  return `${protocol}://${host}`;
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/forgot-password?error=Supabase%20environment%20is%20not%20configured");
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect("/forgot-password?error=Enter%20a%20valid%20email%20address");
  }

  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${origin}/auth/confirm?next=/reset-password`,
    },
  );

  if (error) {
    const errorMessage = error.message.toLowerCase();
    const message =
      errorMessage.includes("rate limit") || errorMessage.includes("too many")
        ? "Too many reset requests. Please wait a moment and try again."
        : "Unable to send a reset link right now. Please try again.";

    redirect(`/forgot-password?error=${encodeURIComponent(message)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent(
      "If an account exists for that email, a password reset link has been sent.",
    )}`,
  );
}
