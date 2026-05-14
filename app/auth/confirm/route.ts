import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(next: string | null) {
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

function redirectWithAuthError(request: NextRequest, message: string) {
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = "/login";
  redirectTo.search = "";
  redirectTo.searchParams.set("error", message);
  return NextResponse.redirect(redirectTo);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = getSafeNextPath(searchParams.get("next"));
  const redirectTo = request.nextUrl.clone();

  redirectTo.pathname = next;
  redirectTo.searchParams.delete("code");
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      return redirectWithAuthError(
        request,
        "Supabase environment is not configured",
      );
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      redirectTo.searchParams.delete("next");
      if (redirectTo.pathname === "/dashboard" || redirectTo.pathname === "/onboarding") {
        redirectTo.searchParams.set("message", "Email verified");
      }
      return NextResponse.redirect(redirectTo);
    }
  }

  if (tokenHash && type) {
    const supabase = await createClient();
    if (!supabase) {
      return redirectWithAuthError(
        request,
        "Supabase environment is not configured",
      );
    }

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      redirectTo.searchParams.delete("next");
      if (redirectTo.pathname === "/dashboard" || redirectTo.pathname === "/onboarding") {
        redirectTo.searchParams.set("message", "Email verified");
      }
      return NextResponse.redirect(redirectTo);
    }
  }

  return redirectWithAuthError(
    request,
    "Confirmation link is invalid or expired. Please create an account again to get a fresh verification email.",
  );
}
