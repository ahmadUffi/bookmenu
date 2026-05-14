"use client";

import { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Loader2,
  Maximize2,
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type FlipbookViewerProps = {
  pdfUrl: string;
  title: string;
};

export default function FlipbookViewer({ pdfUrl, title }: FlipbookViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(false);

  const pages = useMemo(
    () => Array.from({ length: numPages }, (_, index) => index + 1),
    [numPages],
  );

  if (error) {
    return (
      <div className="flex min-h-[560px] flex-col items-center justify-center rounded-[2rem] border border-[#e4dbce] bg-[#fffdf8] p-6 text-center shadow-[var(--shadow-card)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#f3ede3]">
          <Maximize2 size={24} />
        </div>
        <h2 className="mt-5 text-xl font-semibold">PDF preview unavailable</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#666a61]">
          The PDF could not be rendered in the flipbook viewer. You can still
          open the uploaded file directly.
        </p>
        <a
          href={pdfUrl}
          className="mt-5 rounded-2xl bg-[var(--charcoal)] px-5 py-3 text-sm font-semibold text-white"
        >
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-[#666a61] shadow-sm">
          Page {Math.min(page + 1, Math.max(numPages, 1))} of{" "}
          {Math.max(numPages, 1)}
        </p>
        <a
          href={pdfUrl}
          className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-[#d9d0c2] bg-white/88 px-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white"
        >
          <Expand size={16} />
          Fullscreen
        </a>
      </div>

      <div className="rounded-[2rem] border border-[#e4dbce] bg-[#fffdf8] p-3 shadow-[0_24px_70px_rgba(49,42,31,0.12)]">
        <Document
          file={pdfUrl}
          loading={
            <div className="flex min-h-[560px] items-center justify-center rounded-[1.5rem] bg-[#fbf7ef]">
              <Loader2 className="animate-spin text-[var(--green)]" size={30} />
            </div>
          }
          onLoadError={() => setError(true)}
          onLoadSuccess={({ numPages: loadedPages }) => setNumPages(loadedPages)}
        >
          {numPages > 0 ? (
            <HTMLFlipBook
              width={390}
              height={550}
              size="stretch"
              minWidth={280}
              maxWidth={500}
              minHeight={420}
              maxHeight={720}
              showCover
              mobileScrollSupport
              className="mx-auto"
              style={{}}
              startPage={0}
              drawShadow
              flippingTime={650}
              usePortrait
              startZIndex={0}
              autoSize
              maxShadowOpacity={0.18}
              clickEventForward
              useMouseEvents
              swipeDistance={30}
              showPageCorners
              disableFlipByClick={false}
              onFlip={(event) => setPage(event.data)}
            >
              {pages.map((pageNumber) => (
                <div
                  key={pageNumber}
                  className="overflow-hidden rounded-xl bg-white shadow-xl"
                >
                  <Page
                    pageNumber={pageNumber}
                    width={390}
                    renderAnnotationLayer={false}
                    loading={
                      <div className="flex h-full min-h-[520px] items-center justify-center bg-[#fbf7ef]">
                        <Loader2
                          className="animate-spin text-[var(--green)]"
                          size={22}
                        />
                      </div>
                    }
                  />
                </div>
              ))}
            </HTMLFlipBook>
          ) : null}
        </Document>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d9d0c2] bg-white transition hover:-translate-y-0.5 hover:bg-[#fbf7ef]"
          onClick={() => setPage((current) => Math.max(0, current - 1))}
          aria-label="Previous page"
        >
          <ChevronLeft size={20} />
        </button>
        <p className="min-w-28 rounded-full bg-white/80 px-4 py-2 text-center text-sm font-semibold shadow-sm">
          {title}
        </p>
        <button
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d9d0c2] bg-white transition hover:-translate-y-0.5 hover:bg-[#fbf7ef]"
          onClick={() => setPage((current) => Math.min(numPages - 1, current + 1))}
          aria-label="Next page"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
