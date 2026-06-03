"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  Printer,
  RefreshCw,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import type { MenuRecord } from "@/lib/menu-types";
import {
  defaultQrDesign,
  downloadStyledQrPng,
  type QrDesign,
  type QrEyeShape,
  type QrPieceShape,
} from "@/components/menu/styled-qr-code";
import {
  downloadPrintTemplatePng,
  getDefaultTemplateText,
  mergeTemplateText,
  PrintTemplateCard,
  printTemplates,
  type PrintTemplateId,
  type PrintTemplateText,
} from "@/components/menu/qr-print-templates";

type QrPrintStudioProps = {
  menus: MenuRecord[];
};

const defaultPrintTemplateId: PrintTemplateId = "plain";
const cardsPerSheet = 4;

const pieceShapes: Array<{ label: string; value: QrPieceShape }> = [
  { label: "Square", value: "square" },
  { label: "Dots", value: "dots" },
  { label: "Rounded", value: "rounded" },
  { label: "Classy", value: "classy" },
  { label: "Extra Rounded", value: "extra-rounded" },
];

const eyeShapes: Array<{ label: string; value: QrEyeShape }> = [
  { label: "Square", value: "square" },
  { label: "Rounded", value: "rounded" },
  { label: "Dot", value: "dot" },
  { label: "Extra Rounded", value: "extra-rounded" },
];

function chunk<T>(items: T[], size: number) {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

function getRelativeUrl(menu: MenuRecord) {
  return `/menu/${menu.slug}/${menu.documentSlug}`;
}

function storageKey(menuId: string) {
  return `doclume:qr-design:${menuId}`;
}

type StoredQrSettings = {
  design?: Partial<QrDesign>;
  templateId?: PrintTemplateId;
  templateText?: Partial<PrintTemplateText>;
};

function isPrintTemplateId(value: unknown): value is PrintTemplateId {
  return printTemplates.some((template) => template.id === value);
}

function getBrowserOrigin() {
  return typeof window === "undefined" ? "" : window.location.origin;
}

function readStoredSettings(menu: MenuRecord) {
  try {
    const stored = window.localStorage.getItem(storageKey(menu.id));
    if (!stored) {
      const templateId = defaultPrintTemplateId;
      return {
        design: defaultQrDesign,
        templateId,
        templateText: getDefaultTemplateText(templateId, menu),
      };
    }

    const parsed = JSON.parse(stored) as StoredQrSettings & Partial<QrDesign>;
    const hasNewShape = "design" in parsed || "templateId" in parsed || "templateText" in parsed;
    const design = {
      ...defaultQrDesign,
      ...(hasNewShape ? parsed.design : parsed),
    } as QrDesign;
    const templateId = isPrintTemplateId(parsed.templateId)
      ? parsed.templateId
      : defaultPrintTemplateId;
    const defaults = getDefaultTemplateText(templateId, menu);

    return {
      design,
      templateId,
      templateText: mergeTemplateText(defaults, parsed.templateText),
    };
  } catch {
    const templateId = defaultPrintTemplateId;
    return {
      design: defaultQrDesign,
      templateId,
      templateText: getDefaultTemplateText(templateId, menu),
    };
  }
}

function ControlButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 text-left text-sm font-semibold transition ${
        active
          ? "border-[var(--charcoal)] bg-white text-[var(--charcoal)] shadow-sm"
          : "border-[#dbe2ea] bg-[#fbf7ef] text-[#5f6673] hover:bg-white"
      }`}
    >
      {children}
      <span className="h-3 w-3 rounded-full border border-current" />
    </button>
  );
}

export default function QrPrintStudio({ menus }: QrPrintStudioProps) {
  const firstMenu = menus[0] ?? null;
  const initialSettings =
    typeof window !== "undefined" && firstMenu
      ? readStoredSettings(firstMenu)
      : null;
  const [selectedId, setSelectedId] = useState(menus[0]?.id ?? "");
  const [quantity, setQuantity] = useState(4);
  const [design, setDesign] = useState<QrDesign>(
    initialSettings?.design ?? defaultQrDesign,
  );
  const [templateId, setTemplateId] = useState<PrintTemplateId>(
    initialSettings?.templateId ?? defaultPrintTemplateId,
  );
  const [templateText, setTemplateText] = useState<PrintTemplateText>(
    initialSettings?.templateText ??
      (firstMenu
        ? getDefaultTemplateText(defaultPrintTemplateId, firstMenu)
        : { caption: "", footer: "", headline: "", subheadline: "" }),
  );
  const [origin] = useState(() => getBrowserOrigin());
  const [copied, setCopied] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const selectedMenu = useMemo(
    () => menus.find((menu) => menu.id === selectedId) ?? menus[0] ?? null,
    [menus, selectedId],
  );

  const relativeUrl = selectedMenu ? getRelativeUrl(selectedMenu) : "";
  const absoluteUrl = origin && relativeUrl ? `${origin}${relativeUrl}` : relativeUrl;
  const copies = useMemo(
    () => Array.from({ length: Math.max(1, quantity) }, (_, index) => index + 1),
    [quantity],
  );
  const pages = useMemo(() => chunk(copies, cardsPerSheet), [copies]);

  useEffect(() => {
    if (!selectedMenu) return;
    window.localStorage.setItem(
      storageKey(selectedMenu.id),
      JSON.stringify({ design, templateId, templateText }),
    );
  }, [design, selectedMenu, templateId, templateText]);

  function updateDesign(next: Partial<QrDesign>) {
    setDesign((current) => ({ ...current, ...next }));
  }

  async function copyPublicUrl() {
    if (!absoluteUrl) return;

    await navigator.clipboard.writeText(absoluteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function downloadQr() {
    if (!selectedMenu || !absoluteUrl) return;
    if (templateId === "plain") {
      await downloadStyledQrPng(
        absoluteUrl,
        design,
        `${selectedMenu.slug}-${selectedMenu.documentSlug}-qr.png`,
      );
      return;
    }

    await downloadPrintTemplatePng({
      design,
      filename: `${selectedMenu.slug}-${selectedMenu.documentSlug}-${templateId}.png`,
      menu: selectedMenu,
      publicUrl: absoluteUrl,
      templateId,
      text: templateText,
    });
  }

  function uploadLogo(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      updateDesign({ logoDataUrl: reader.result });
    };
    reader.readAsDataURL(file);
  }

  function selectDocument(menuId: string) {
    const nextMenu = menus.find((menu) => menu.id === menuId) ?? menus[0] ?? null;
    setSelectedId(menuId);
    if (!nextMenu) return;

    const nextSettings = readStoredSettings(nextMenu);
    setDesign(nextSettings.design);
    setTemplateId(nextSettings.templateId);
    setTemplateText(nextSettings.templateText);
  }

  function selectTemplate(nextTemplateId: PrintTemplateId) {
    setTemplateId(nextTemplateId);
    if (!selectedMenu) return;

    const defaults = getDefaultTemplateText(nextTemplateId, selectedMenu);
    setTemplateText(defaults);
  }

  function updateTemplateText(field: keyof PrintTemplateText, value: string) {
    setTemplateText((current) => ({ ...current, [field]: value }));
  }

  function resetTemplateText() {
    if (!selectedMenu) return;
    setTemplateText(getDefaultTemplateText(templateId, selectedMenu));
  }

  if (!selectedMenu) {
    return (
      <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm">
        <h2 className="font-semibold">No active document</h2>
        <p className="mt-2 text-sm leading-6 text-[#666a61]">
          Upload a PDF document from the dashboard to generate printable QR cards.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-8 xl:grid-cols-[430px_1fr]">
      <aside className="qr-print-hide space-y-4">
        <section className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-4 border-b border-[#e4dbce] px-5 py-4">
            <div>
              <h2 className="font-semibold">QR Code Styling</h2>
              <p className="mt-1 text-xs font-medium text-[#73766e]">
                Customize frames, colors, shapes, and corners.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDesign(defaultQrDesign)}
              className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-[#dbe2ea] bg-white px-3 text-sm font-semibold transition hover:bg-[#fbf7ef]"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>

          <div className="max-h-[calc(100vh-140px)] space-y-6 overflow-y-auto p-5">
            <label className="block text-sm font-semibold">
              PDF document
              <select
                value={selectedMenu.id}
                onChange={(event) => selectDocument(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-xl border border-[#ded5c7] bg-[#fbf7ef] px-4 text-sm outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15"
              >
                {menus.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.title}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase text-[#151924]">Logos</p>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex min-h-8 items-center gap-2 rounded-xl border border-[#dbe2ea] bg-white px-3 text-xs font-semibold text-[#5f6673]"
                >
                  <Upload size={14} />
                  Upload
                </button>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => uploadLogo(event.target.files?.[0] ?? null)}
              />
              <div className="mt-3 grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => updateDesign({ logoDataUrl: undefined })}
                  className={`flex min-h-12 items-center justify-center rounded-xl border text-xs font-semibold transition ${
                    !design.logoDataUrl
                      ? "border-[var(--charcoal)] bg-white"
                      : "border-[#dbe2ea] bg-[#fbf7ef] text-[#5f6673] hover:bg-white"
                  }`}
                  title="Use document icon"
                >
                  <FileText size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex min-h-12 items-center justify-center rounded-xl border border-[#dbe2ea] bg-[#fbf7ef] text-[#5f6673] transition hover:bg-white"
                  title="Upload logo"
                >
                  <Upload size={17} />
                </button>
                <div className="flex min-h-12 items-center justify-center rounded-xl border border-[#dbe2ea] bg-white p-1">
                  {design.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={design.logoDataUrl}
                      alt="Uploaded QR logo"
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-[#9aa0aa]">Logo</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => updateDesign({ logoDataUrl: undefined })}
                  className="flex min-h-12 items-center justify-center rounded-xl border border-[#dbe2ea] bg-[#fbf7ef] text-[#5f6673] transition hover:bg-white"
                  title="Clear logo"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase text-[#151924]">
                  Print Template
                </p>
                <button
                  type="button"
                  onClick={resetTemplateText}
                  className="inline-flex min-h-8 items-center gap-2 rounded-xl border border-[#dbe2ea] bg-white px-3 text-xs font-semibold text-[#5f6673]"
                >
                  <RotateCcw size={14} />
                  Text
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {printTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => selectTemplate(template.id)}
                    className={`min-h-11 rounded-xl border px-3 text-left text-sm font-semibold transition duration-200 hover:shadow-sm ${
                      templateId === template.id
                        ? "border-[var(--charcoal)] bg-white text-[var(--charcoal)] shadow-sm"
                        : "border-[#dbe2ea] bg-[#fbf7ef] text-[#5f6673] hover:bg-white"
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase text-[#151924]">
                Template Text
              </p>
              {(
                [
                  ["headline", "Headline"],
                  ["subheadline", "Subheadline"],
                  ["caption", "Caption"],
                  ["footer", "Small text"],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="block text-sm font-semibold">
                  {label}
                  <input
                    value={templateText[field]}
                    maxLength={field === "footer" ? 60 : 52}
                    onChange={(event) => updateTemplateText(field, event.target.value)}
                    className="mt-2 min-h-11 w-full rounded-xl border border-[#ded5c7] bg-white px-3 text-sm outline-none transition focus:border-[var(--green)] focus:ring-4 focus:ring-[#426b4f]/15"
                  />
                </label>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-[#151924]">Shapes</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {pieceShapes.map((shape) => (
                  <ControlButton
                    key={shape.value}
                    active={design.pieceShape === shape.value}
                    onClick={() => updateDesign({ pieceShape: shape.value })}
                  >
                    {shape.label}
                  </ControlButton>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                QR Code Color
                <div className="mt-2 flex gap-2">
                  <input
                    value={design.foregroundColor}
                    onChange={(event) =>
                      updateDesign({ foregroundColor: event.target.value })
                    }
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#ded5c7] bg-white px-3 text-sm"
                  />
                  <input
                    aria-label="QR code color"
                    type="color"
                    value={design.foregroundColor}
                    onChange={(event) =>
                      updateDesign({ foregroundColor: event.target.value })
                    }
                    className="h-11 w-12 rounded-xl border border-[#ded5c7] bg-white p-1"
                  />
                </div>
              </label>

              <label className="block text-sm font-semibold">
                Background Color
                <div className="mt-2 flex gap-2">
                  <input
                    value={design.backgroundColor}
                    onChange={(event) =>
                      updateDesign({ backgroundColor: event.target.value })
                    }
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#ded5c7] bg-white px-3 text-sm"
                  />
                  <input
                    aria-label="QR background color"
                    type="color"
                    value={design.backgroundColor}
                    onChange={(event) =>
                      updateDesign({ backgroundColor: event.target.value })
                    }
                    className="h-11 w-12 rounded-xl border border-[#ded5c7] bg-white p-1"
                  />
                </div>
              </label>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-[#151924]">Corners</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {eyeShapes.map((shape) => (
                  <ControlButton
                    key={shape.value}
                    active={design.eyeShape === shape.value}
                    onClick={() => updateDesign({ eyeShape: shape.value })}
                  >
                    {shape.label}
                  </ControlButton>
                ))}
              </div>
              <label className="mt-3 block text-sm font-semibold">
                Corner Color
                <div className="mt-2 flex gap-2">
                  <input
                    value={design.eyeColor}
                    onChange={(event) => updateDesign({ eyeColor: event.target.value })}
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#ded5c7] bg-white px-3 text-sm"
                  />
                  <input
                    aria-label="QR corner color"
                    type="color"
                    value={design.eyeColor}
                    onChange={(event) => updateDesign({ eyeColor: event.target.value })}
                    className="h-11 w-12 rounded-xl border border-[#ded5c7] bg-white p-1"
                  />
                </div>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Print quantity
                <input
                  min={1}
                  max={120}
                  type="number"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.max(1, Math.min(120, Number(event.target.value) || 1)),
                    )
                  }
                  className="mt-2 min-h-11 w-full rounded-xl border border-[#ded5c7] bg-[#fbf7ef] px-4 text-sm outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[#426b4f]/15"
                />
              </label>

              <div className="rounded-xl border border-[#dbe2ea] bg-[#fbf7ef] p-3">
                <p className="text-sm font-semibold">A4 layout</p>
                <div className="mt-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#4d5149]">
                  4 cards per sheet
                </div>
                <p className="mt-2 text-xs leading-5 text-[#73766e]">
                  Fixed 2 x 2 layout keeps each template readable when printed.
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--charcoal)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#30332d]"
              >
                <Printer size={17} />
                Print A4 layout
              </button>
              <button
                type="button"
                onClick={copyPublicUrl}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d9d0c2] bg-white px-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[#fbf7ef]"
              >
                {copied ? <Check size={17} /> : <Copy size={17} />}
                {copied ? "Copied" : "Copy public link"}
              </button>
              <button
                type="button"
                onClick={downloadQr}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d9d0c2] bg-white px-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[#fbf7ef]"
              >
                <Download size={17} />
                Download PNG
              </button>
            </div>
          </div>
        </section>
      </aside>

      <section className="rounded-[2rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-[var(--shadow-card)] md:p-8">
        <div className="qr-print-hide flex flex-col justify-between gap-4 border-b border-[#e4dbce] pb-5 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--green)]">
              Preview
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              {selectedMenu.title}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#666a61]">
              {absoluteUrl}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDesign(defaultQrDesign)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#d9d0c2] bg-white px-4 text-sm font-semibold transition hover:bg-[#fbf7ef]"
          >
            <RefreshCw size={16} />
            Reset Design
          </button>
        </div>

        <div className="qr-print-hide grid gap-5 py-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div className="rounded-2xl border border-[#dbe2ea] bg-white p-5">
            <div className="mx-auto w-full max-w-[320px]">
              <PrintTemplateCard
                design={design}
                menu={selectedMenu}
                publicUrl={absoluteUrl}
                templateId={templateId}
                text={templateText}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-[#dbe2ea] bg-[#fbf7ef] p-4">
            <p className="text-sm font-semibold">{selectedMenu.restaurantName}</p>
            <p className="mt-1 text-sm text-[#666a61]">
              Selected print template:{" "}
              {printTemplates.find((template) => template.id === templateId)?.name ??
                "Plain QR"}
            </p>
            <div className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#5f6673]">
              {quantity} card{quantity === 1 ? "" : "s"} across {pages.length} sheet
              {pages.length === 1 ? "" : "s"}
              {" "}at {cardsPerSheet} per A4
            </div>
          </div>
        </div>

        <div className="qr-print-area space-y-6">
          {pages.map((pageItems, pageIndex) => (
            <div
              key={pageIndex}
              className="qr-print-sheet qr-print-sheet-4 mx-auto grid aspect-[210/297] w-full max-w-[720px] gap-3 rounded-2xl border border-[#ded5c7] bg-white p-4 shadow-sm"
            >
              {pageItems.map((copyNumber) => (
                <article
                  key={copyNumber}
                  className="qr-print-card h-full overflow-hidden rounded-xl border border-[#dbe2ea] bg-white"
                >
                  <PrintTemplateCard
                    design={design}
                    menu={selectedMenu}
                    publicUrl={absoluteUrl}
                    templateId={templateId}
                    text={templateText}
                  />
                </article>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
