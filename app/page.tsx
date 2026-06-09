import Link from "next/link";
import LandingSimulation from "@/components/landing/landing-simulation";
import PdfPreviewCards from "@/components/landing/pdf-preview-cards";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  FileUp,
  Layers3,
  Menu,
  MousePointer2,
  Palette,
  QrCode,
  Sparkles,
  Utensils,
} from "lucide-react";

const steps = [
  {
    title: "Upload PDF",
    description:
      "Masukkan menu, katalog, brosur, proposal, atau profil bisnis.",
    icon: FileUp,
  },
  {
    title: "Jadi flipbook",
    description:
      "PDF tampil sebagai halaman digital yang enak dibuka di browser.",
    icon: BookOpen,
  },
  {
    title: "Bagikan QR",
    description:
      "Tempel QR di meja, kasir, booth, katalog cetak, atau media sosial.",
    icon: QrCode,
  },
];

const features = [
  {
    title: "PDF tetap rapi",
    description:
      "Desain asli dari file kamu tetap terasa premium tanpa perlu membuat halaman baru dari nol.",
    icon: FileText,
  },
  {
    title: "Pengalaman flip",
    description:
      "Pengunjung bisa membalik halaman, membaca detail, dan fokus ke isi dokumen.",
    icon: MousePointer2,
  },
  {
    title: "Siap QR menu",
    description:
      "Cocok untuk restoran, cafe, booth event, showroom, dan bisnis yang butuh akses cepat.",
    icon: QrCode,
  },
  {
    title: "Dashboard dokumen",
    description:
      "Kelola PDF, link publik, profil bisnis, dan aset QR dari satu workspace.",
    icon: Layers3,
  },
  {
    title: "QR print studio",
    description:
      "Pilih dokumen, atur warna, bentuk QR, logo, template print, jumlah kartu, lalu download PNG atau print A4.",
    icon: Palette,
  },
  {
    title: "Profil bisnis",
    description:
      "Update nama workspace dan upload logo agar dokumen publik terasa sesuai brand bisnis kamu.",
    icon: Building2,
  },
  {
    title: "Usage & billing",
    description:
      "Pantau jumlah upload PDF, scan QR, status paket, tanggal aktif, dan riwayat invoice.",
    icon: CreditCard,
  },
  {
    title: "Statistik cepat",
    description:
      "Lihat ringkasan dokumen aktif, workspace, dan link publik langsung dari overview dashboard.",
    icon: BarChart3,
  },
];

const useCases = [
  "Menu restoran",
  "Katalog produk",
  "Brosur promosi",
  "Proposal",
  "Profil usaha",
];

const samplePages = [
  {
    title: "Menu Restoran",
    subtitle: "Preview PDF menu",
    accent: "bg-[#f97316]",
    panel: "bg-[#fff7ed]",
    file: "/sample-menu.pdf",
  },
  {
    title: "Katalog Produk",
    subtitle: "Preview PDF katalog",
    accent: "bg-[#0ea5e9]",
    panel: "bg-[#eff6ff]",
    file: "/sample-catalog.pdf",
  },
  {
    title: "Brosur Promo",
    subtitle: "Preview PDF brosur",
    accent: "bg-[#14b8a6]",
    panel: "bg-[#f0fdfa]",
    file: "/sample-brochure.pdf",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f0f9ff] text-[#0c2a3f]">
      <nav className="fixed left-3 right-3 top-3 z-50 rounded-2xl border border-sky-100 bg-white/90 px-3 py-3 shadow-[0_16px_44px_rgba(12,42,63,0.1)] backdrop-blur-xl md:left-6 md:right-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c4a6e] text-white">
              <BookOpen size={18} />
            </span>
            FlipDulu
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#contoh" className="transition hover:text-[#0c4a6e]">
              Contoh flip
            </a>
            <a href="#simulasi" className="transition hover:text-[#0c4a6e]">
              Simulasi
            </a>
            <a href="#fitur" className="transition hover:text-[#0c4a6e]">
              Fitur
            </a>
            <a href="#harga" className="transition hover:text-[#0c4a6e]">
              Harga
            </a>
            <Link href="/admin" className="transition hover:text-[#0c4a6e]">
              Admin
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-sky-50 sm:inline-flex"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.22)] transition hover:-translate-y-0.5 hover:bg-[#ea580c]"
            >
              Coba gratis
              <ArrowRight size={16} />
            </Link>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-100 bg-white/80 md:hidden"
              aria-label="Buka menu"
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </nav>

      <section className="relative px-4 pb-12 pt-28 md:pb-20 md:pt-36">
        <div className="absolute inset-0 -z-10 mv-grid-bg opacity-60" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/82 px-3 py-1.5 text-sm font-semibold text-[#0c4a6e] shadow-sm">
              <Sparkles size={15} />
              PDF jadi flipbook digital dalam hitungan menit
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight text-[#082f49] md:text-7xl">
              FlipDulu sebelum pelanggan bertanya file menunya mana.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              Ubah PDF menu, katalog, dan brosur jadi halaman flip yang nyaman
              dibuka lewat link atau QR. Tidak perlu desain ulang, tinggal
              upload dan bagikan.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#0ea5e9] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0284c7]"
              >
                Mulai upload PDF
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#contoh"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-white/82 px-5 py-3 text-sm font-semibold text-[#0c4a6e] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Lihat contoh flip
                <BookOpen size={18} />
              </Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {["Upload PDF", "Link publik", "QR siap pakai"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-sky-100 bg-white/76 p-3 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  <Check className="mb-2 text-[#0ea5e9]" size={17} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white p-3 shadow-[0_30px_90px_rgba(12,42,63,0.16)]">
              <div className="relative min-h-[560px] overflow-hidden rounded-[1.5rem] bg-[#082f49]">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.42),rgba(8,47,73,0.95)),repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_48px)]" />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between rounded-2xl border border-white/20 bg-white/90 p-3 text-sm shadow-xl backdrop-blur">
                  <div>
                    <p className="font-semibold text-[#082f49]">
                      Menu Sore Kopi
                    </p>
                    <p className="text-slate-500">Preview flip PDF</p>
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-700">
                    Live
                  </span>
                </div>
                <div className="absolute inset-x-4 top-24">
                  <div className="mx-auto flex max-w-[560px] items-center justify-center gap-3">
                    <button
                      className="hidden h-11 w-11 items-center justify-center rounded-full bg-white/16 text-white backdrop-blur transition hover:bg-white/24 sm:inline-flex"
                      aria-label="Halaman sebelumnya"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <div className="grid w-full grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-[0_28px_70px_rgba(0,0,0,0.3)]">
                      {samplePages.slice(0, 2).map((page, index) => (
                        <div
                          key={page.title}
                          className={`min-h-[320px] border-slate-200 p-5 ${
                            index === 0 ? "border-r" : ""
                          } ${page.panel}`}
                        >
                          <div
                            className={`h-2 w-16 rounded-full ${page.accent}`}
                          />
                          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Halaman {index + 1}
                          </p>
                          <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#082f49]">
                            {page.title}
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {page.subtitle}
                          </p>
                          <div className="mt-8 space-y-3">
                            {[72, 92, 64].map((width) => (
                              <div
                                key={width}
                                className="h-3 rounded-full bg-slate-200"
                                style={{ width: `${width}%` }}
                              />
                            ))}
                          </div>
                          <div className="mt-8 aspect-[4/3] rounded-2xl bg-white/70" />
                        </div>
                      ))}
                    </div>
                    <button
                      className="hidden h-11 w-11 items-center justify-center rounded-full bg-white/16 text-white backdrop-blur transition hover:bg-white/24 sm:inline-flex"
                      aria-label="Halaman berikutnya"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 grid gap-3 md:grid-cols-[1fr_164px]">
                  <div className="rounded-3xl border border-white/20 bg-white/92 p-5 shadow-2xl backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#0ea5e9]">
                          Contoh flip landing page
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#082f49]">
                          Nanti PDF dari public bisa muncul di area ini.
                        </h2>
                      </div>
                      <Utensils className="text-[#f97316]" size={28} />
                    </div>
                    <div className="mt-5 flex gap-2">
                      {samplePages.map((page, index) => (
                        <div
                          key={page.title}
                          className="aspect-[3/4] w-16 rounded-xl border border-sky-100 bg-white p-2"
                        >
                          <div
                            className={`h-2 w-8 rounded-full ${page.accent}`}
                          />
                          <p className="mt-3 text-[10px] font-semibold text-slate-500">
                            0{index + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white p-4 text-center shadow-2xl">
                    <div className="mx-auto grid aspect-square w-full max-w-[132px] grid-cols-5 gap-1 rounded-2xl bg-sky-50 p-3">
                      {Array.from({ length: 25 }, (_, index) => (
                        <span
                          key={index}
                          className={`rounded-sm ${
                            index % 3 === 0 || index % 7 === 0
                              ? "bg-[#082f49]"
                              : "bg-white"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#082f49]">
                      Scan QR menu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0ea5e9]">
            Satu link untuk banyak dokumen
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-5">
            {useCases.map((name) => (
              <div
                key={name}
                className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm font-semibold text-[#0c4a6e]"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contoh" className="px-4 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0ea5e9]">
              Preview PDF
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#082f49] md:text-5xl">
              Tiga contoh PDF berbeda, tetap terasa seperti katalog digital.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Taruh tiga file sample di folder public. Pengunjung bisa melihat
              contoh menu, katalog, dan brosur tanpa membuka file mentah.
            </p>
            <div className="mt-7 rounded-3xl border border-sky-100 bg-white/70 p-4 text-sm leading-6 text-slate-600">
              File yang dibaca:{" "}
              <span className="font-semibold text-[#0c4a6e]">
                /sample-menu.pdf
              </span>
              ,{" "}
              <span className="font-semibold text-[#0c4a6e]">
                /sample-catalog.pdf
              </span>
              , dan{" "}
              <span className="font-semibold text-[#0c4a6e]">
                /sample-brochure.pdf
              </span>
              .
            </div>
          </div>
          <PdfPreviewCards samples={samplePages} />
        </div>
      </section>

      <LandingSimulation />

      <section id="fitur" className="bg-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0ea5e9]">
              Fitur utama
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#082f49] md:text-5xl">
              Lebih enak daripada mengirim PDF mentah.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(12,42,63,0.09)]"
              >
                <feature.icon className="text-[#0ea5e9]" size={26} />
                <h3 className="mt-7 text-xl font-semibold text-[#082f49]">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0ea5e9]">
                Upload, publish, scan
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#082f49] md:text-5xl">
                Dari PDF ke menu digital dalam satu alur pendek.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Cocok untuk bisnis yang sudah punya desain PDF dan ingin
                membagikannya dengan pengalaman baca yang lebih halus.
              </p>
            </div>
            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-3xl border border-sky-100 bg-white/80 p-5 shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-[#0ea5e9] shadow-sm">
                    <step.icon size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-400">
                      0{index + 1}
                    </p>
                    <h3 className="mt-1 font-semibold text-[#082f49]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="harga" className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#082f49] bg-[#082f49] p-6 text-white shadow-[0_30px_90px_rgba(12,42,63,0.22)] md:p-10 lg:p-16">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-sky-100">
              <Sparkles size={15} />
              Harga sederhana
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
              Mulai gratis, upgrade saat dokumen bertambah.
            </h2>
            <p className="mt-4 text-white/72">
              Pilih paket sesuai kebutuhan QR menu, katalog, dan dokumen publik
              bisnis kamu.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: "Rp0",
                period: "/ bulan",
                items: [
                  "1x upload PDF",
                  "QR menu",
                  "1000x scan QR",
                  "Owner dashboard",
                ],
                featured: false,
                cta: "Mulai gratis",
              },
              {
                name: "Monthly",
                price: "Rp9.000",
                period: "/ bulan",
                items: ["5x upload PDF", "Unlimited QR scan", "Custom QR"],
                featured: false,
                cta: "Pilih bulanan",
              },
              {
                name: "Yearly",
                price: "Rp99.000",
                period: "/ tahun",
                items: ["5x upload PDF", "Unlimited QR scan", "Custom QR"],
                featured: true,
                cta: "Pilih tahunan",
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-3xl p-6 backdrop-blur transition ${
                  plan.featured
                    ? "border-2 border-[#f97316] bg-white/12 shadow-[0_0_30px_rgba(249,115,22,0.18)] hover:bg-white/14"
                    : "border border-white/12 bg-white/5 hover:border-white/20 hover:bg-white/8"
                }`}
              >
                {plan.featured ? (
                  <div className="absolute -top-3 right-6 rounded-full bg-[#f97316] px-3 py-1 text-xs font-semibold text-white">
                    Paling hemat
                  </div>
                ) : null}
                <div>
                  <p className="text-sm font-semibold text-white/70">
                    {plan.name}
                  </p>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-semibold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="ml-1 text-sm font-medium text-white/55">
                      {plan.period}
                    </span>
                  </div>
                  <ul className="mt-6 space-y-3.5 text-sm text-white/72">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check size={16} className="shrink-0 text-sky-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    href="/register"
                    className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${
                      plan.featured
                        ? "bg-[#f97316] text-white shadow-[0_12px_30px_rgba(249,115,22,0.24)] hover:-translate-y-0.5 hover:bg-[#ea580c]"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-sky-100 bg-white px-4 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold text-[#082f49]"
          >
            <BookOpen size={18} />
            FlipDulu
          </Link>
          <p>
            PDF jadi flipbook digital untuk menu, katalog, brosur, dan proposal.
          </p>
        </div>
      </footer>
    </main>
  );
}
