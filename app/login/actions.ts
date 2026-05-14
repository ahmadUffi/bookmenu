"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = authSchema.extend({
  businessName: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2).max(120),
});

async function getCredentials(formData: FormData) {
  return authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

async function getOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  return `${protocol}://${host}`;
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?error=Supabase%20environment%20is%20not%20configured");
  }

  const credentials = await getCredentials(formData);

  if (!credentials.success) {
    redirect("/login?error=Enter%20a%20valid%20email%20and%20password");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword(credentials.data);

  if (error) {
    const errorMessage = error.message.toLowerCase();
    const message = errorMessage.includes("email not confirmed")
      ? "Please verify your email first. Check your inbox or spam folder for the verification link."
      : errorMessage.includes("invalid login credentials")
        ? "Email or password is incorrect."
        : errorMessage.includes("rate limit") || errorMessage.includes("too many")
          ? "Too many login attempts. Please wait a moment and try again."
          : "Unable to sign in right now. Please try again.";

    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      revalidatePath("/", "layout");
      redirect("/admin");
    }

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!restaurant) {
      revalidatePath("/", "layout");
      redirect("/onboarding");
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?error=Supabase%20environment%20is%20not%20configured");
  }

  const parsed = registerSchema.safeParse({
    businessName: formData.get("businessName"),
    email: formData.get("email"),
    name: formData.get("name"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/register?error=Name%2C%20business%20name%2C%20email%2C%20and%20password%20are%20required");
  }

  const origin = await getOrigin();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
      data: {
        business_name: parsed.data.businessName,
        name: parsed.data.name,
        role: "user",
      },
    },
  });

  if (error) {
    const errorMessage = error.message.toLowerCase();
    const message =
      errorMessage.includes("already registered") ||
      errorMessage.includes("already exists")
        ? "This email is already registered. Please log in, or check your email if you have not verified it yet."
        : errorMessage.includes("rate limit") || errorMessage.includes("email rate")
          ? "We could not send another verification email right now. Please wait a moment and try again."
          : errorMessage.includes("password")
            ? "Password must be at least 8 characters."
            : "Unable to create account right now. Please try again.";

    redirect(`/register?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/", "layout");
  redirect(
    `/login?message=${encodeURIComponent(
      "Account created. Please check your email inbox or spam folder to verify your account before logging in.",
    )}`,
  );
}
