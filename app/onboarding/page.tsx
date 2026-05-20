import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, FileText } from "lucide-react";
import PendingSubmitButton from "@/components/ui/pending-submit-button";
import { createClient } from "@/lib/supabase/server";
import { createBusinessProfile } from "./actions";

export default async function OnboardingPage(props: PageProps<"/onboarding">) {
  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : null;
  const message =
    typeof searchParams.message === "string" ? searchParams.message : null;
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

  const { data: existing } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existing) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[var(--cream)] px-4 py-6 text-[var(--charcoal)]">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-[#e1d8ca] bg-[#fffdf8] p-6 shadow-[0_30px_90px_rgba(49,42,31,0.14)] md:p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--charcoal)] text-white">
              <FileText size={19} />
            </span>
            DocLume
          </Link>
          <div className="mt-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--green-soft)] text-[var(--green)]">
              <Building2 size={22} />
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              Add your business name
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#666a61]">
              This creates your workspace profile and public document slug. You
              can upload PDFs after this step.
            </p>
          </div>

          <form action={createBusinessProfile} className="mt-8 space-y-5">
            <label className="block text-sm font-semibold">
              Business name
              <input
                required
                name="businessName"
                className="mt-2 min-h-12 w-full rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 text-sm outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15"
                placeholder="Acme Studio"
              />
            </label>
            <PendingSubmitButton
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)]"
              pendingText="Creating workspace"
            >
              Continue to dashboard
            </PendingSubmitButton>
          </form>

          {message ? (
            <p className="mt-5 rounded-2xl border border-[#cfe1cf] bg-[#eef6ed] px-4 py-3 text-sm font-medium text-[var(--green-dark)]">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {error}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
