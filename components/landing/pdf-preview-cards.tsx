"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { BookOpen, FileText, Maximize2, X } from "lucide-react";

const FlipbookViewer = dynamic(() => import("@/components/menu/flipbook-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[58vh] items-center justify-center bg-white text-sm font-semibold text-[#0c4a6e]">
      Memuat flipbook...
    </div>
  ),
});

type PdfPreview = {
  title: string;
  subtitle: string;
  accent: string;
  panel: string;
  file: string;
};

type PdfPreviewCardsProps = {
  samples: PdfPreview[];
};

export default function PdfPreviewCards({ samples }: PdfPreviewCardsProps) {
  const [activePdf, setActivePdf] = useState<PdfPreview | null>(null);

  useEffect(() => {
    if (!activePdf) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePdf(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activePdf]);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {samples.map((page, index) => (
          <article
            key={page.title}
            className={`overflow-hidden rounded-3xl border border-sky-100 shadow-sm ${page.panel}`}
          >
            <div className="p-5">
              <div className={`h-2 w-14 rounded-full ${page.accent}`} />
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Preview 0{index + 1}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-[#082f49]">
                {page.title}
              </h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                {page.subtitle}
              </p>
            </div>
            <div className="mx-5 overflow-hidden rounded-2xl border border-white/70 bg-white">
              <object
                data={`${page.file}#toolbar=0&navpanes=0&scrollbar=0`}
                type="application/pdf"
                className="h-[300px] w-full"
                aria-label={`Preview PDF ${page.title}`}
              >
                <div className="flex h-[300px] flex-col items-center justify-center bg-white p-5 text-center">
                  <FileText className="text-[#0ea5e9]" size={30} />
                  <p className="mt-3 text-sm font-semibold text-[#082f49]">
                    Preview PDF belum tersedia.
                  </p>
                </div>
              </object>
            </div>
            <div className="p-5">
              <button
                type="button"
                onClick={() => setActivePdf(page)}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#082f49] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(8,47,73,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0c4a6e]"
              >
                Preview flip
                <BookOpen size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {activePdf ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#082f49]/78 p-3 backdrop-blur-sm md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview flip ${activePdf.title}`}
          onClick={() => setActivePdf(null)}
        >
          <div
            className="flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/20 bg-[#f8fbff] shadow-[0_30px_90px_rgba(0,0,0,0.32)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-sky-100 bg-white px-4 py-3 md:px-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#0ea5e9]">
                  Flip PDF preview
                </p>
                <h3 className="truncate text-lg font-semibold text-[#082f49]">
                  {activePdf.title}
                </h3>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={activePdf.file}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-100 bg-white text-[#0c4a6e] transition hover:bg-sky-50"
                  aria-label="Buka PDF di tab baru"
                >
                  <Maximize2 size={17} />
                </a>
                <button
                  type="button"
                  onClick={() => setActivePdf(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-100 bg-white text-[#0c4a6e] transition hover:bg-sky-50"
                  aria-label="Tutup preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-[#f0f9ff] p-0 md:p-4">
              <FlipbookViewer pdfUrl={activePdf.file} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
