import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileUp,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PendingSubmitButton from "@/components/ui/pending-submit-button";
import { login } from "./actions";

const authHighlights = [
  { icon: FileUp, label: "Upload PDF" },
  { icon: QrCode, label: "QR siap pakai" },
  { icon: ShieldCheck, label: "Akses aman" },
];

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const error =
    typeof searchParams.error === "string" ? searchParams.error : undefined;
  const message =
    typeof searchParams.message === "string" ? searchParams.message : undefined;

  return (
    <main className="min-h-screen bg-[#f0f9ff] px-4 py-5 text-[#082f49] md:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_30px_90px_rgba(12,42,63,0.14)] lg:grid-cols-[0.92fr_1.08fr]">
          <section className="relative overflow-hidden bg-[#082f49] p-7 text-white md:p-10">
            <div className="absolute inset-0 mv-grid-bg opacity-10" />
            <div className="absolute bottom-0 right-0 h-56 w-56 translate-x-16 translate-y-16 rounded-full bg-[#0ea5e9]/24 blur-3xl" />
            <div className="relative z-10 flex min-h-[440px] flex-col justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-lg font-semibold"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#082f49]">
                  <BookOpen size={19} />
                </span>
                FlipDulu
              </Link>
              <div className="max-w-md">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-sky-100">
                  <Sparkles size={15} />
                  Selamat datang kembali
                </p>
                <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                  Lanjut kelola PDF, link publik, dan QR menu kamu.
                </h1>
                <p className="mt-5 leading-7 text-white/70">
                  Masuk untuk upload dokumen, menyalin link publik, mengatur QR,
                  dan memantau penggunaan paket FlipDulu.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {authHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur"
                  >
                    <item.icon className="text-sky-200" size={20} />
                    <p className="mt-3 text-sm font-semibold">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex items-center bg-[#f8fbff] p-5 md:p-8 lg:p-10">
            <div className="w-full">
              <form
                action={login}
                className="rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-sm md:p-6"
              >
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Masuk akun
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Gunakan email dan password yang terdaftar.
                  </p>
                </div>
                <label className="mt-6 block text-sm font-semibold">
                  Email
                  <input
                    required
                    name="email"
                    type="email"
                    className="mt-2 min-h-12 w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 text-sm outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-4 focus:ring-sky-100"
                    placeholder="nama@email.com"
                  />
                </label>
                <label className="mt-4 block text-sm font-semibold">
                  Password
                  <input
                    required
                    name="password"
                    type="password"
                    minLength={8}
                    className="mt-2 min-h-12 w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 text-sm outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-4 focus:ring-sky-100"
                    placeholder="Minimal 8 karakter"
                  />
                </label>
                <div className="mt-3 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-[#0ea5e9] hover:text-[#0284c7]"
                  >
                    Lupa password?
                  </Link>
                </div>
                <PendingSubmitButton
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#f97316] px-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.2)] transition hover:-translate-y-0.5 hover:bg-[#ea580c]"
                  pendingText="Sedang masuk"
                >
                  Masuk
                  <ArrowRight size={17} />
                </PendingSubmitButton>
              </form>
              <p className="mt-5 text-center text-sm text-slate-600">
                Baru di FlipDulu?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#0ea5e9] hover:text-[#0284c7]"
                >
                  Buat akun
                </Link>
              </p>
              <div className="mt-5 space-y-3">
                {message ? (
                  <p className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800">
                    {message}
                  </p>
                ) : null}
                {error ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
