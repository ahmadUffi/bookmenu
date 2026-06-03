"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/reset-password?error=Supabase%20environment%20is%20not%20configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/forgot-password?error=${encodeURIComponent(
        "Password reset link is invalid or expired. Please request a new link.",
      )}`,
    );
  }

  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const mismatch = parsed.error.issues.some(
      (issue) => issue.path[0] === "confirmPassword",
    );
    const message = mismatch
      ? "Passwords do not match."
      : "Password must be at least 8 characters.";

    redirect(`/reset-password?error=${encodeURIComponent(message)}`);
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    const errorMessage = error.message.toLowerCase();
    const message = errorMessage.includes("password")
      ? "Password must be at least 8 characters."
      : "Unable to update password right now. Please try again.";

    redirect(`/reset-password?error=${encodeURIComponent(message)}`);
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(
    `/login?message=${encodeURIComponent(
      "Password updated. Please log in with your new password.",
    )}`,
  );
}
