import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase?.auth.signOut();

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = "/login";
  redirectTo.search = "";
  redirectTo.searchParams.set("message", "Logged out successfully");

  return NextResponse.redirect(redirectTo);
}
