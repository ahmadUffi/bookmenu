"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChefHat,
  Clock3,
  FileUp,
  Layers3,
  Menu,
  QrCode,
  Smartphone,
  Sparkles,
  Star,
} from "lucide-react";

const steps = [
  {
    title: "Upload PDF",
    description: "Validate restaurant menu PDFs and store them for public access.",
    icon: FileUp,
  },
  {
    title: "Publish menu",
    description: "Generate a clean mobile URL with a restaurant-friendly slug.",
    icon: BookOpen,
  },
  {
    title: "Print QR",
    description: "Download a QR code customers can scan from the table.",
    icon: QrCode,
  },
];

const features = [
  {
    title: "PDF-to-menu publishing",
    description:
      "Preserve your designed menu and publish it as a fast, branded reading experience.",
    icon: FileUp,
  },
  {
    title: "QR table system",
    description:
      "Create table-ready cards with clean QR previews and shareable public links.",
    icon: QrCode,
  },
  {
    title: "Restaurant dashboard",
    description:
      "Track menus, active links, uploads, and QR assets from a calm operator workspace.",
    icon: Layers3,
  },
  {
    title: "Mobile-first viewer",
    description:
      "Guests get large controls, swipe-friendly navigation, and focused fullscreen reading.",
    icon: Smartphone,
  },
];

const restaurants = ["Maison Verde", "Nori Table", "Alta Bistro"];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--cream)] text-[var(--charcoal)]">
      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="fixed left-3 right-3 top-3 z-50 rounded-2xl border border-[#e7dfd1]/80 bg-[#fffdf8]/86 px-3 py-3 shadow-[0_16px_44px_rgba(49,42,31,0.1)] backdrop-blur-xl md:left-6 md:right-6"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--charcoal)] text-white">
              <ChefHat size={18} />
            </span>
            MenuVerse
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-[#62655c] md:flex">
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
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-[#4d5149] transition hover:bg-[#efe7da] sm:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--charcoal)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(31,33,29,0.18)] transition hover:-translate-y-0.5 hover:bg-[#30332d]"
            >
              Dashboard
              <ArrowRight size={16} />
            </Link>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e3dbce] bg-white/70 md:hidden"
              aria-label="Open menu"
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </motion.nav>

      <motion.section
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative px-4 pb-16 pt-28 md:pb-24 md:pt-36"
      >
        <div className="absolute inset-0 -z-10 mv-grid-bg opacity-70" />
        <div className="absolute left-1/2 top-20 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#dfe8dd] blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <motion.div variants={fadeUp} transition={{ duration: 0.55, ease: "easeOut" }}>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d9e4d9] bg-white/70 px-3 py-1.5 text-sm font-semibold text-[var(--green-dark)] shadow-sm">
              <Sparkles size={15} />
              Digital menu infrastructure for modern restaurants
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight md:text-7xl">
              Publish elegant QR menus from any PDF.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#62655c] md:text-xl">
              MenuVerse turns a restaurant PDF into a premium mobile flipbook, a
              shareable public link, and table-ready QR cards without changing
              the menu workflow your team already uses.
            </p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(66,107,79,0.24)] transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)]"
              >
                Start publishing
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#ddd4c6] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--charcoal)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Manage menus
                <ArrowUpRight size={18} />
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {["2 min setup", "PDF native", "QR ready"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#e3dbce] bg-white/64 p-3 text-sm font-semibold text-[#4c5047] shadow-sm"
                >
                  <Check className="mb-2 text-[var(--green)]" size={17} />
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="relative"
          >
            <div className="overflow-hidden rounded-[2rem] border border-[#e4dbce] bg-[#fffdf8] p-3 shadow-[0_30px_90px_rgba(49,42,31,0.18)]">
              <motion.div
                whileHover={{ scale: 1.008 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative min-h-[620px] overflow-hidden rounded-[1.5rem] bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f211d]/80 via-[#1f211d]/20 to-transparent" />
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.45 }}
                  className="absolute left-4 right-4 top-4 flex items-center justify-between rounded-2xl border border-white/20 bg-white/82 p-3 text-sm shadow-xl backdrop-blur"
                >
                  <div>
                    <p className="font-semibold">Maison Verde</p>
                    <p className="text-[#70736b]">Spring tasting menu</p>
                  </div>
                  <span className="rounded-full bg-[var(--green-soft)] px-3 py-1 font-semibold text-[var(--green-dark)]">
                    Live
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
                  className="absolute bottom-4 left-4 right-4 grid gap-3 md:grid-cols-[1fr_170px]"
                >
                  <div className="rounded-3xl border border-white/20 bg-white/90 p-5 shadow-2xl backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--green)]">
                          Public viewer
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                          A calm reading room for every guest.
                        </h2>
                      </div>
                      <Smartphone className="text-[var(--green)]" size={28} />
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((page) => (
                        <div
                          key={page}
                          className="aspect-[3/4] rounded-xl border border-[#e8e1d6] bg-[#fbf7ef] p-2"
                        >
                          <div className="h-2 w-10 rounded-full bg-[#cec4b5]" />
                          <div className="mt-3 space-y-2">
                            <div className="h-2 rounded-full bg-[#e2d9cc]" />
                            <div className="h-2 w-2/3 rounded-full bg-[#e2d9cc]" />
                            <div className="h-12 rounded-lg bg-[#dfe8dd]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white p-4 text-center shadow-2xl">
                    <div className="mx-auto grid aspect-square w-full max-w-[132px] grid-cols-5 gap-1 rounded-2xl bg-[#f6f1e8] p-3">
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
                    <p className="mt-3 text-sm font-semibold">Table QR</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="bg-[#fffdf8] px-4 py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--green)]">
                Restaurant showcase
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
                Built for menus that deserve to feel considered.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {restaurants.map((name, index) => (
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  key={name}
                  className="rounded-3xl border border-[#e8e1d6] bg-[#fbf7ef] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-center justify-between">
                    <ChefHat className="text-[var(--green)]" size={22} />
                    <div className="flex text-[#c7a45a]">
                      {Array.from({ length: 5 }, (_, star) => (
                        <Star key={star} size={13} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <h3 className="mt-7 text-lg font-semibold">{name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#686b63]">
                    {index + 4} menus, QR live across dining room and terrace.
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="px-4 py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--green)]">
              Complete product system
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
              Premium SaaS controls, restaurant-simple workflow.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <motion.article
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                key={feature.title}
                className="rounded-[1.5rem] border border-[#e4dbce] bg-white/72 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
              >
                <feature.icon className="text-[var(--green)]" size={26} />
                <h3 className="mt-7 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-[#62655c]">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="workflow"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="bg-[#fffdf8] px-4 py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--green)]">
                Upload PDF - Get online menu
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
                From file upload to table scan in minutes.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#62655c]">
                The system keeps operations familiar while adding a polished
                guest-facing layer: validate the PDF, publish the menu, copy the
                URL, and download QR assets.
              </p>
            </div>
            <div className="grid gap-3">
              {steps.map((step, index) => (
                <motion.div
                  variants={fadeUp}
                  key={step.title}
                  className="flex gap-4 rounded-3xl border border-[#e4dbce] bg-[#fbf7ef] p-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--green)] shadow-sm">
                    <step.icon size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#909186]">0{index + 1}</p>
                    <h3 className="mt-1 font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#62655c]">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="pricing"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="px-4 py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#ded5c7] bg-[var(--charcoal)] p-6 text-white shadow-[0_30px_90px_rgba(31,33,29,0.2)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-[#dfe8dd]">
                <Clock3 size={15} />
                Pricing placeholder
              </p>
              <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
                Launch with the dashboard now. Add billing when the plan is ready.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-white/68">
                This placeholder keeps the page commercially complete without
                adding payment logic.
              </p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/8 p-6 backdrop-blur">
              <p className="text-sm font-semibold text-[#dfe8dd]">Starter</p>
              <p className="mt-3 text-4xl font-semibold">
                $0<span className="text-base font-medium text-white/55"> / preview</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-white/72">
                {["PDF menu upload", "Public menu link", "QR download", "Owner dashboard"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check size={16} className="text-[#aac7ad]" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      <footer className="border-t border-[#e4dbce] bg-[#fffdf8] px-4 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[#62655c] md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold text-[var(--charcoal)]"
          >
            <ChefHat size={18} />
            MenuVerse
          </Link>
          <p>
            Digital menu publishing for restaurants, cafes, hotels, and modern
            dining teams.
          </p>
        </div>
      </footer>
    </main>
  );
}
