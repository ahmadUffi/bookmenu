import Link from "next/link";
import { ArrowRight, FileText, FileUp, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import PendingSubmitButton from "@/components/ui/pending-submit-button";
import { login } from "./actions";

const authHighlights = [
  { icon: FileUp, label: "Upload" },
  { icon: QrCode, label: "QR cards" },
  { icon: ShieldCheck, label: "Secure" },
];

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const error =
    typeof searchParams.error === "string" ? searchParams.error : undefined;
  const message =
    typeof searchParams.message === "string" ? searchParams.message : undefined;

  return (
    <main className="min-h-screen bg-[var(--cream)] px-4 py-5 text-[var(--charcoal)] md:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-[#e1d8ca] bg-[#fffdf8] shadow-[0_30px_90px_rgba(49,42,31,0.14)] lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative overflow-hidden bg-[var(--charcoal)] p-7 text-white md:p-10">
            <div className="absolute inset-0 mv-grid-bg opacity-10" />
            <div className="absolute -right-28 top-16 h-72 w-72 rounded-full bg-[var(--green)]/35 blur-3xl" />
            <div className="relative z-10 flex min-h-[440px] flex-col justify-between">
              <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--charcoal)]">
                  <FileText size={19} />
                </span>
                DocLume
              </Link>
              <div className="max-w-md">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-[#dfe8dd]">
                  <Sparkles size={15} />
                  Welcome back
                </p>
                <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                  Continue managing your PDF showcase workspace.
                </h1>
                <p className="mt-5 leading-7 text-white/68">
                  Supabase auth protects dashboard access and keeps document
                  records tied to the right owner.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {authHighlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur">
                    <item.icon className="text-[#aac7ad]" size={20} />
                    <p className="mt-3 text-sm font-semibold">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex items-center p-5 md:p-8 lg:p-10">
            <div className="w-full">
              <form action={login} className="rounded-[1.5rem] border border-[#e5dccf] bg-white p-5 shadow-sm md:p-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Login</h2>
                  <p className="mt-2 text-sm leading-6 text-[#666a61]">
                    Enter your credentials to open the dashboard.
                  </p>
                </div>
                <label className="mt-6 block text-sm font-semibold">
                  Email
                  <input required name="email" type="email" className="mt-2 min-h-12 w-full rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 text-sm outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15" placeholder="owner@restaurant.com" />
                </label>
                <label className="mt-4 block text-sm font-semibold">
                  Password
                  <input required name="password" type="password" minLength={8} className="mt-2 min-h-12 w-full rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 text-sm outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15" placeholder="At least 8 characters" />
                </label>
                <PendingSubmitButton
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--charcoal)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#30332d]"
                  pendingText="Signing in"
                >
                  Login
                  <ArrowRight size={17} />
                </PendingSubmitButton>
              </form>
              <p className="mt-5 text-center text-sm text-[#666a61]">
                New to DocLume?{" "}
                <Link href="/register" className="font-semibold text-[var(--green)] hover:text-[var(--green-dark)]">
                  Create an account
                </Link>
              </p>
              <div className="mt-5 space-y-3">
                {message ? <p className="rounded-2xl border border-[#cfe1cf] bg-[#eef6ed] px-4 py-3 text-sm font-medium text-[var(--green-dark)]">{message}</p> : null}
                {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</p> : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
