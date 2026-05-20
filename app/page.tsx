import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  FileText,
  FileUp,
  Layers3,
  Menu,
  QrCode,
  Smartphone,
  Sparkles,
  Wand2,
} from "lucide-react";

const steps = [
  {
    title: "Upload PDF",
    description: "Add a menu, catalog, proposal, brochure, or profile PDF.",
    icon: FileUp,
  },
  {
    title: "Publish showcase",
    description: "Create a polished web reader with one clean public link.",
    icon: BookOpen,
  },
  {
    title: "Share anywhere",
    description: "Copy the link or download a QR code for print and campaigns.",
    icon: QrCode,
  },
];

const features = [
  {
    title: "PDF showcase publishing",
    description:
      "Keep your designed PDF intact and present it as a premium web-ready document.",
    icon: FileUp,
  },
  {
    title: "QR-ready sharing",
    description:
      "Turn every document into a scannable experience for tables, counters, events, and sales decks.",
    icon: QrCode,
  },
  {
    title: "Document dashboard",
    description:
      "Manage uploaded PDFs, active links, business details, and QR assets from one focused workspace.",
    icon: Layers3,
  },
  {
    title: "Mobile-first reading",
    description:
      "Visitors get large controls, swipe-friendly navigation, and a focused fullscreen viewer.",
    icon: Smartphone,
  },
];

const useCases = ["Menus", "Catalogs", "Proposals", "Brochures", "Portfolios"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--cream)] text-[var(--charcoal)]">
      <nav className="fixed left-3 right-3 top-3 z-50 rounded-2xl border border-[#dbe2ea]/90 bg-white/88 px-3 py-3 shadow-[0_16px_44px_rgba(20,24,34,0.1)] backdrop-blur-xl md:left-6 md:right-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--charcoal)] text-white">
              <FileText size={18} />
            </span>
            DocLume
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-[#5f6673] md:flex">
            <a href="#features" className="transition hover:text-[var(--charcoal)]">
              Features
            </a>
            <a href="#workflow" className="transition hover:text-[var(--charcoal)]">
              Workflow
            </a>
            <a href="#pricing" className="transition hover:text-[var(--charcoal)]">
              Pricing
            </a>
            <Link href="/admin" className="transition hover:text-[var(--charcoal)]">
              Admin
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-[#4f5867] transition hover:bg-[#eef2f7] sm:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--charcoal)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(20,24,34,0.18)] transition hover:-translate-y-0.5 hover:bg-[#242936]"
            >
              Dashboard
              <ArrowRight size={16} />
            </Link>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dbe2ea] bg-white/70 md:hidden"
              aria-label="Open menu"
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </nav>

      <section className="relative px-4 pb-12 pt-28 md:pb-20 md:pt-36">
        <div className="absolute inset-0 -z-10 mv-grid-bg opacity-70" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-white/80 px-3 py-1.5 text-sm font-semibold text-[var(--green-dark)] shadow-sm">
              <Sparkles size={15} />
              PDF showcase platform for modern teams
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight md:text-7xl">
              Make every PDF feel ready to present.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f6673] md:text-xl">
              DocLume turns menus, catalogs, brochures, proposals, and company
              profiles into elegant web viewers with share links and QR codes.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,118,110,0.24)] transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)]"
              >
                Create a showcase
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#dbe2ea] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--charcoal)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Manage documents
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {["PDF native", "Mobile ready", "QR included"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#dbe2ea] bg-white/72 p-3 text-sm font-semibold text-[#4f5867] shadow-sm"
                >
                  <Check className="mb-2 text-[var(--green)]" size={17} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-[#dbe2ea] bg-white p-3 shadow-[0_30px_90px_rgba(20,24,34,0.16)]">
              <div className="relative min-h-[580px] overflow-hidden rounded-[1.5rem] bg-[#111827]">
                <div className="absolute inset-0 mv-hero-surface" />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between rounded-2xl border border-white/20 bg-white/88 p-3 text-sm shadow-xl backdrop-blur">
                  <div>
                    <p className="font-semibold">Brand Catalog 2026</p>
                    <p className="text-[#697386]">Universal PDF showcase</p>
                  </div>
                  <span className="rounded-full bg-[var(--green-soft)] px-3 py-1 font-semibold text-[var(--green-dark)]">
                    Live
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 grid gap-3 md:grid-cols-[1fr_170px]">
                  <div className="rounded-3xl border border-white/20 bg-white/92 p-5 shadow-2xl backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--green)]">
                          Public reader
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                          A polished reading room for any PDF.
                        </h2>
                      </div>
                      <Wand2 className="text-[var(--green)]" size={28} />
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((page) => (
                        <div
                          key={page}
                          className="aspect-[3/4] rounded-xl border border-[#dbe2ea] bg-[#f8fafc] p-2"
                        >
                          <div className="h-2 w-10 rounded-full bg-[#94a3b8]" />
                          <div className="mt-3 space-y-2">
                            <div className="h-2 rounded-full bg-[#cbd5e1]" />
                            <div className="h-2 w-2/3 rounded-full bg-[#cbd5e1]" />
                            <div className="h-12 rounded-lg bg-[#d9f2ef]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white p-4 text-center shadow-2xl">
                    <div className="mx-auto grid aspect-square w-full max-w-[132px] grid-cols-5 gap-1 rounded-2xl bg-[#f8fafc] p-3">
                      {Array.from({ length: 25 }, (_, index) => (
                        <span
                          key={index}
                          className={`rounded-sm ${
                            index % 3 === 0 || index % 7 === 0
                              ? "bg-[var(--charcoal)]"
                              : "bg-white"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-sm font-semibold">Share QR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--green)]">
            One tool, many documents
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-5">
            {useCases.map((name) => (
              <div
                key={name}
                className="rounded-2xl border border-[#dbe2ea] bg-[#f8fafc] p-4 text-sm font-semibold text-[#343b48]"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--green)]">
              Complete publishing system
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
              Better than sending people to a raw PDF file.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-[1.5rem] border border-[#dbe2ea] bg-white/76 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
              >
                <feature.icon className="text-[var(--green)]" size={26} />
                <h3 className="mt-7 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-[#5f6673]">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-white px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--green)]">
                Upload PDF - Publish showcase
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
                From file upload to shareable document in minutes.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#5f6673]">
                Keep the workflow simple: validate the PDF, publish the viewer,
                copy the URL, and download QR assets when you need print access.
              </p>
            </div>
            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-3xl border border-[#dbe2ea] bg-[#f8fafc] p-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--green)] shadow-sm">
                    <step.icon size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#8a94a6]">0{index + 1}</p>
                    <h3 className="mt-1 font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#5f6673]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#1f2937] bg-[var(--charcoal)] p-6 text-white shadow-[0_30px_90px_rgba(20,24,34,0.2)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-[#ccfbf1]">
                <Sparkles size={15} />
                Starter access
              </p>
              <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
                Publish the first showcase now. Add billing when the plan is ready.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-white/68">
                The product is commercially positioned without introducing
                payment logic before the pricing model is finalized.
              </p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/8 p-6 backdrop-blur">
              <p className="text-sm font-semibold text-[#ccfbf1]">Starter</p>
              <p className="mt-3 text-4xl font-semibold">
                $0<span className="text-base font-medium text-white/55"> / preview</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-white/72">
                {["PDF upload", "Public document link", "QR download", "Owner dashboard"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check size={16} className="text-[#5eead4]" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#dbe2ea] bg-white px-4 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[#5f6673] md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold text-[var(--charcoal)]"
          >
            <FileText size={18} />
            DocLume
          </Link>
          <p>PDF showcase publishing for menus, catalogs, proposals, and brochures.</p>
        </div>
      </footer>
    </main>
  );
}
