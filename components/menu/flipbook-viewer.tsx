"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight, Loader2, Maximize2 } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type FlipbookViewerProps = {
  pdfUrl: string;
};

type FlipbookController = {
  flipNext: () => void;
  flipPrev: () => void;
};

type FlipbookHandle = {
  pageFlip: () => FlipbookController | null;
};

type FlipPageProps = {
  children: ReactNode;
  hard?: boolean;
  height: number;
  width: number;
};

const FlipPage = forwardRef<HTMLDivElement, FlipPageProps>(function FlipPage(
  { children, hard = false, height, width },
  ref,
) {
  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-xl bg-white shadow-xl"
      data-density={hard ? "hard" : undefined}
      style={{ width, height }}
    >
      {children}
    </div>
  );
});

export default function FlipbookViewer({ pdfUrl }: FlipbookViewerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<FlipbookHandle | null>(null);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastFlipSoundAtRef = useRef(0);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(0);
  const [pageRatio, setPageRatio] = useState(390 / 550);
  const [bookSize, setBookSize] = useState({ width: 390, height: 550 });
  const [isMobileBook, setIsMobileBook] = useState(false);
  const [error, setError] = useState(false);
  const renderPixelRatio =
    typeof window === "undefined"
      ? 2
      : Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);

  const pages = useMemo(
    () => Array.from({ length: numPages }, (_, index) => index + 1),
    [numPages],
  );
  const renderedPages = useMemo(() => {
    const currentPage = page + 1;
    return new Set(
      pages.filter((pageNumber) => Math.abs(pageNumber - currentPage) <= 3),
    );
  }, [page, pages]);

  function playFlipSound() {
    const now = Date.now();

    if (now - lastFlipSoundAtRef.current < 250) {
      return;
    }

    lastFlipSoundAtRef.current = now;
    flipAudioRef.current ??= new Audio("/flip.mp3");
    flipAudioRef.current.volume = 0.3;
    flipAudioRef.current.currentTime = 0;
    void flipAudioRef.current.play().catch(() => {});
  }

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const updateSize = () => {
      const vw = frame.clientWidth;
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      setIsMobileBook(mobile);
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const availableHeight = Math.max(frame.clientHeight, 320);
      const vh = mobile
        ? availableHeight
        : Math.max(Math.min(availableHeight, viewportHeight - 240), 320);
      const widthByHeight = Math.floor(vh * pageRatio);
      const horizontalGap = mobile ? 0 : 36;
      const widthByFrame = mobile ? vw : Math.floor((vw - horizontalGap) / 2);
      const nextWidth = Math.max(260, Math.min(widthByFrame, widthByHeight, 720));
      const nextHeight = Math.floor(nextWidth / pageRatio);
      setBookSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight },
      );
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(frame);
    window.addEventListener("resize", updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [pageRatio]);

  if (error) {
    return (
      <div className="flex min-h-[560px] flex-col items-center justify-center rounded-[2rem] border border-[#e4dbce] bg-white p-6 text-center shadow-[var(--shadow-card)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#f3ede3]">
          <Maximize2 size={24} />
        </div>
        <h2 className="mt-5 text-xl font-semibold">PDF preview unavailable</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#666a61]">
          The PDF could not be rendered in the showcase viewer. You can still
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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div
        ref={frameRef}
        className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-none border-0 bg-white p-0 md:rounded-[1.4rem] md:border md:border-[#dbeafe] md:p-2 sm:rounded-[2rem] sm:p-3"
      >
        <Document
          file={pdfUrl}
          loading={
            <div className="flex h-full w-full items-center justify-center rounded-none bg-white md:min-h-[58vh] md:rounded-[1rem]">
              <Loader2 className="animate-spin text-[var(--green)]" size={30} />
            </div>
          }
          onLoadError={() => setError(true)}
          onLoadSuccess={async (pdf) => {
            setError(false);
            setPage(0);
            setNumPages(pdf.numPages);
            const firstPage = await pdf.getPage(1);
            const viewport = firstPage.getViewport({ scale: 1 });
            const nextRatio = viewport.width / viewport.height;
            if (Number.isFinite(nextRatio) && nextRatio > 0) {
              setPageRatio(nextRatio);
            }
          }}
        >
          {numPages > 0 ? (
            <div
              className="transition-transform duration-500 ease-out"
              style={{
                transform:
                  !isMobileBook && page <= 0
                    ? `translateX(-${bookSize.width / 2}px)`
                    : "translateX(0)",
              }}
            >
              <HTMLFlipBook
                ref={bookRef}
                width={bookSize.width}
                height={bookSize.height}
                size="fixed"
                minWidth={260}
                maxWidth={980}
                minHeight={320}
                maxHeight={1400}
                showCover
                mobileScrollSupport
                className="mx-auto"
                style={{}}
                startPage={0}
                drawShadow
                flippingTime={650}
                usePortrait={isMobileBook}
                startZIndex={0}
                autoSize
                maxShadowOpacity={0.18}
                clickEventForward
                useMouseEvents
                swipeDistance={30}
                showPageCorners
                disableFlipByClick={false}
                onFlip={(event) => {
                  setPage(event.data);
                }}
                onChangeState={(event) => {
                  if (event.data === "flipping") {
                    playFlipSound();
                  }
                }}
              >
                {pages.map((pageNumber) => {
                  const isCover = pageNumber === 1 || pageNumber === numPages;

                  return (
                    <FlipPage
                      key={pageNumber}
                      hard={isCover}
                      width={bookSize.width}
                      height={bookSize.height}
                    >
                      {renderedPages.has(pageNumber) ? (
                        <Page
                          pageNumber={pageNumber}
                          width={bookSize.width}
                          devicePixelRatio={renderPixelRatio}
                          renderAnnotationLayer={false}
                          renderTextLayer={false}
                          loading={
                            <div
                              className="flex items-center justify-center bg-[#f8fafc]"
                              style={{
                                width: bookSize.width,
                                height: bookSize.height,
                              }}
                            >
                              <Loader2
                                className="animate-spin text-[var(--green)]"
                                size={22}
                              />
                            </div>
                          }
                        />
                      ) : (
                        <div
                          className="bg-[#f8fafc]"
                          style={{
                            width: bookSize.width,
                            height: bookSize.height,
                          }}
                        />
                      )}
                    </FlipPage>
                  );
                })}
              </HTMLFlipBook>
            </div>
          ) : null}
        </Document>
      </div>

      <div className="flex flex-none items-center justify-center gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:gap-3 sm:pb-0 sm:pt-3">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d9d0c2] bg-white transition hover:-translate-y-0.5 hover:bg-[#fbf7ef] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:h-12 sm:w-12"
          onClick={() => {
            playFlipSound();
            bookRef.current?.pageFlip?.()?.flipPrev?.();
          }}
          aria-label="Previous page"
          disabled={page <= 0}
        >
          <ChevronLeft size={20} />
        </button>
        <p className="min-w-24 max-w-[52vw] truncate rounded-full bg-white/80 px-3 py-2 text-center text-sm font-semibold shadow-sm sm:min-w-28 sm:px-4">
          {Math.min(page + 1, Math.max(numPages, 1))} of {Math.max(numPages, 1)}
        </p>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d9d0c2] bg-white transition hover:-translate-y-0.5 hover:bg-[#fbf7ef] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:h-12 sm:w-12"
          onClick={() => {
            playFlipSound();
            bookRef.current?.pageFlip?.()?.flipNext?.();
          }}
          aria-label="Next page"
          disabled={page >= numPages - 1}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
