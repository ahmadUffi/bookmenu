import Link from "next/link";
import { ChefHat, Check, FileUp, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { register } from "../login/actions";

const authHighlights = [
  { icon: FileUp, label: "Upload" },
  { icon: QrCode, label: "QR cards" },
  { icon: ShieldCheck, label: "Secure" },
];

export default async function RegisterPage(props: PageProps<"/register">) {
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
            <div className="relative z-10 flex min-h-[440px] flex-col justify-between">
              <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--charcoal)]">
                  <ChefHat size={19} />
                </span>
                MenuVerse
              </Link>
              <div className="max-w-md">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-[#dfe8dd]">
                  <Sparkles size={15} />
                  Create workspace
                </p>
                <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                  Start publishing premium digital menus today.
                </h1>
                <p className="mt-5 leading-7 text-white/68">
                  New accounts receive the user role. Your business name creates
                  the public menu slug after email verification.
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
              <form action={register} className="rounded-[1.5rem] border border-[#e5dccf] bg-white p-5 shadow-sm md:p-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Register</h2>
                  <p className="mt-2 text-sm leading-6 text-[#666a61]">
                    Create your restaurant owner account.
                  </p>
                </div>
                <label className="mt-6 block text-sm font-semibold">
                  Name
                  <input required name="name" className="mt-2 min-h-12 w-full rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 text-sm outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15" placeholder="Ayu Pratama" />
                </label>
                <label className="mt-4 block text-sm font-semibold">
                  Business name
                  <input required name="businessName" className="mt-2 min-h-12 w-full rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 text-sm outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15" placeholder="Warung Bromo" />
                </label>
                <label className="mt-4 block text-sm font-semibold">
                  Email
                  <input required name="email" type="email" className="mt-2 min-h-12 w-full rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 text-sm outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15" placeholder="owner@restaurant.com" />
                </label>
                <label className="mt-4 block text-sm font-semibold">
                  Password
                  <input required name="password" type="password" minLength={8} className="mt-2 min-h-12 w-full rounded-2xl border border-[#ded5c7] bg-[#fbf7ef] px-4 text-sm outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15" placeholder="At least 8 characters" />
                </label>
                <button className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)]">
                  Create account
                  <Check size={17} />
                </button>
              </form>
              <p className="mt-5 text-center text-sm text-[#666a61]">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-[var(--green)] hover:text-[var(--green-dark)]">
                  Login
                </Link>
              </p>
              {error ? <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</p> : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
