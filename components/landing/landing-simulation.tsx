"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Check,
  Copy,
  Download,
  FileCheck2,
  FileText,
  Palette,
  QrCode,
  Upload,
} from "lucide-react";

const stages = [
  {
    key: "upload",
    label: "Upload",
    title: "Upload PDF dan beri judul dokumen",
    description:
      "Dashboard menerima PDF, menampilkan batas ukuran, dan memberi status siap upload sebelum dipublish.",
    icon: Upload,
  },
  {
    key: "publish",
    label: "Publish",
    title: "Link publik langsung siap dibagikan",
    description:
      "Dokumen aktif muncul di daftar, lengkap dengan URL publik untuk dibuka pelanggan.",
    icon: FileCheck2,
  },
  {
    key: "qr",
    label: "QR Studio",
    title: "Custom QR untuk meja, kasir, dan cetakan",
    description:
      "Atur warna, bentuk, logo, template print, jumlah kartu, lalu download PNG atau print A4.",
    icon: QrCode,
  },
  {
    key: "usage",
    label: "Usage",
    title: "Pantau kuota paket dan scan QR",
    description:
      "Billing menampilkan limit upload PDF, penggunaan scan QR, status paket, dan invoice.",
    icon: BarChart3,
  },
] as const;

const stageIndexMap = {
  upload: 0,
  publish: 1,
  qr: 2,
  usage: 3,
} as const;

export default function LandingSimulation() {
  const [stage, setStage] = useState<(typeof stages)[number]["key"]>("upload");
  const activeStage = useMemo(
    () => stages.find((item) => item.key === stage) ?? stages[0],
    [stage],
  );
  const activeIndex = stageIndexMap[stage];
  const Icon = activeStage.icon;

  return (
    <section id="simulasi" className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0ea5e9]">
              Simulasi dashboard
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#082f49] md:text-5xl">
              Klik alurnya, lihat apa yang pengguna lakukan setelah masuk.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Ini ringkasan interaktif dari fitur dashboard FlipDulu: upload PDF,
              publish link, custom QR, dan pantau penggunaan paket.
            </p>
            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              {stages.map((item) => {
                const ItemIcon = item.icon;
                const isActive = item.key === stage;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStage(item.key)}
                    className={`flex min-h-12 items-center gap-3 rounded-2xl border px-4 text-left text-sm font-semibold transition ${
                      isActive
                        ? "border-[#0ea5e9] bg-sky-50 text-[#0c4a6e] shadow-sm"
                        : "border-sky-100 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50"
                    }`}
                  >
                    <ItemIcon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-sky-100 bg-[#f8fbff] p-4 shadow-[0_24px_70px_rgba(12,42,63,0.11)] md:p-6">
            <div className="rounded-[1.5rem] border border-sky-100 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#082f49] text-white">
                    <Icon size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0ea5e9]">
                      {activeStage.label}
                    </p>
                    <h3 className="font-semibold text-[#082f49]">
                      {activeStage.title}
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                  Step 0{activeIndex + 1}
                </span>
              </div>

              <div className="grid gap-5 p-4 md:grid-cols-[0.88fr_1.12fr] md:p-6">
                <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
                  <p className="text-sm font-semibold text-[#082f49]">
                    {activeStage.description}
                  </p>
                  <div className="mt-5 space-y-3">
                    {stages.map((item, index) => {
                      const isDone = index <= activeIndex;

                      return (
                        <div key={item.key} className="flex items-center gap-3">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                              isDone
                                ? "border-[#0ea5e9] bg-[#0ea5e9] text-white"
                                : "border-sky-200 bg-white text-slate-400"
                            }`}
                          >
                            {isDone ? <Check size={14} /> : index + 1}
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              isDone ? "text-[#0c4a6e]" : "text-slate-400"
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="min-h-[360px] rounded-3xl border border-sky-100 bg-white p-5 shadow-sm">
                  {stage === "upload" ? <UploadPanel /> : null}
                  {stage === "publish" ? <PublishPanel /> : null}
                  {stage === "qr" ? <QrPanel /> : null}
                  {stage === "usage" ? <UsagePanel /> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UploadPanel() {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Upload PDF document
          </p>
          <h4 className="mt-2 text-xl font-semibold text-[#082f49]">
            Menu Sore Kopi
          </h4>
        </div>
        <FileText className="text-[#0ea5e9]" size={28} />
      </div>
      <div className="mt-5 rounded-3xl border border-dashed border-sky-200 bg-sky-50 p-6 text-center">
        <Upload className="mx-auto text-[#0ea5e9]" size={30} />
        <p className="mt-4 text-sm font-semibold text-[#082f49]">
          menu-sore-kopi.pdf
        </p>
        <p className="mt-1 text-xs text-slate-500">PDF siap diupload</p>
      </div>
      <button className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0ea5e9] px-4 text-sm font-semibold text-white">
        <Upload size={17} />
        Upload document
      </button>
    </div>
  );
}

function PublishPanel() {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Active documents", "3"],
          ["Workspaces", "1"],
          ["Published links", "3"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-sky-100 bg-sky-50 p-3">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#082f49]">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-3xl border border-sky-100 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="font-semibold text-[#082f49]">Menu Sore Kopi</h4>
            <p className="mt-1 text-sm text-slate-500">
              /menu/sore-kopi/menu-sore-kopi
            </p>
          </div>
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
            Active
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 text-sm font-semibold text-[#0c4a6e]">
            <Copy size={16} />
            Copy
          </button>
          <button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 text-sm font-semibold text-[#0c4a6e]">
            <QrCode size={16} />
            QR
          </button>
        </div>
      </div>
    </div>
  );
}

function QrPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          QR code styling
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {["Rounded", "Dots", "Plain", "Poster"].map((item) => (
            <button
              key={item}
              className="min-h-11 rounded-xl border border-sky-100 bg-sky-50 px-3 text-left text-sm font-semibold text-[#0c4a6e]"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {["#082f49", "#0ea5e9", "#f97316"].map((color) => (
            <span
              key={color}
              className="h-10 w-10 rounded-xl border border-sky-100"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <button className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#082f49] px-4 text-sm font-semibold text-white">
          <Download size={16} />
          Download PNG
        </button>
      </div>
      <div className="rounded-3xl border border-sky-100 bg-white p-4">
        <div className="grid aspect-square grid-cols-5 gap-1 rounded-2xl bg-sky-50 p-3">
          {Array.from({ length: 25 }, (_, index) => (
            <span
              key={index}
              className={`rounded-sm ${
                index % 3 === 0 || index % 7 === 0 ? "bg-[#082f49]" : "bg-white"
              }`}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#0c4a6e]">
          <Palette size={16} />
          Custom QR
        </div>
      </div>
    </div>
  );
}

function UsagePanel() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Usage analysis
      </p>
      <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4">
        <p className="text-sm font-semibold text-[#082f49]">Monthly Plan</p>
        <p className="mt-1 text-xs text-slate-500">Pro features unlocked</p>
      </div>
      {[
        ["PDF uploads", "3 / 5", "60%"],
        ["QR code scans", "1.240 / unlimited", "24%"],
      ].map(([label, value, width]) => (
        <div key={label} className="mt-5">
          <div className="flex justify-between gap-3 text-sm font-semibold">
            <span className="text-slate-600">{label}</span>
            <span className="text-[#082f49]">{value}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky-100">
            <div className="h-full rounded-full bg-[#0ea5e9]" style={{ width }} />
          </div>
        </div>
      ))}
      <div className="mt-6 rounded-2xl border border-sky-100 p-4 text-sm font-semibold text-slate-600">
        Invoice dan pembayaran diproses melalui billing dashboard.
      </div>
    </div>
  );
}
