import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, KeyRound, Mail, ShieldCheck } from "lucide-react";
import PendingSubmitButton from "@/components/ui/pending-submit-button";
import { requestPasswordReset } from "./actions";

export default async function ForgotPasswordPage(
  props: PageProps<"/forgot-password">,
) {
  const searchParams = await props.searchParams;
  const error =
    typeof searchParams.error === "string" ? searchParams.error : undefined;

  return (
    <main className="min-h-screen bg-[var(--cream)] px-4 py-5 text-[var(--charcoal)] md:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-[#e1d8ca] bg-[#fffdf8] shadow-[0_30px_90px_rgba(49,42,31,0.14)] lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative overflow-hidden bg-[var(--charcoal)] p-7 text-white md:p-10">
            <div className="absolute inset-0 mv-grid-bg opacity-10" />
            <div className="absolute -right-28 top-16 h-72 w-72 rounded-full bg-[var(--green)]/35 blur-3xl" />
            <div className="relative z-10 flex min-h-[400px] flex-col justify-between">
              <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--charcoal)]">
                  <FileText size={19} />
                </span>
                DocLume
              </Link>
              <div className="max-w-md">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-[#dfe8dd]">
                  <KeyRound size={15} />
                  Password reset
                </p>
                <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                  Get a secure link back into your workspace.
                </h1>
                <p className="mt-5 leading-7 text-white/68">
                  The reset email returns through the Supabase callback before
                  letting you choose a new password.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur">
                  <Mail className="text-[#aac7ad]" size={20} />
                  <p className="mt-3 text-sm font-semibold">Email link</p>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur">
                  <ShieldCheck className="text-[#aac7ad]" size={20} />
                  <p className="mt-3 text-sm font-semibold">Callback session</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center p-5 md:p-8 lg:p-10">
            <div className="w-full">
              <form action={requestPasswordReset} className="rounded-[1.5rem] border border-[#e5dccf] bg-white p-5 shadow-sm md:p-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Forgot password</h2>
                  <p className="mt-2 text-sm leading-6 text-[#666a61]">
                    Enter your account email to receive a reset link.
                  </p>
                </div>
                <label className="mt-6 block text-sm font-semibold">
                  Email
                  <input required name="email" type="email" className="mt-2 min-h-12 w-full rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 text-sm outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15" placeholder="owner@restaurant.com" />
                </label>
                <PendingSubmitButton
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--charcoal)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#30332d]"
                  pendingText="Sending reset link"
                >
                  Send reset link
                  <ArrowRight size={17} />
                </PendingSubmitButton>
              </form>
              <p className="mt-5 text-center text-sm text-[#666a61]">
                <Link href="/login" className="inline-flex items-center gap-2 font-semibold text-[var(--green)] hover:text-[var(--green-dark)]">
                  <ArrowLeft size={15} />
                  Back to login
                </Link>
              </p>
              <div className="mt-5 space-y-3">
                {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</p> : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
