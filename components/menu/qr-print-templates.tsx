"use client";

import type { CSSProperties } from "react";
import type { MenuRecord } from "@/lib/menu-types";
import StyledQrCode, {
  getStyledQrDataUrl,
  type QrDesign,
} from "@/components/menu/styled-qr-code";

export type PrintTemplateId =
  | "original"
  | "plain"
  | "framed"
  | "sketch"
  | "sunrise"
  | "elegant"
  | "checker";

export type PrintTemplateText = {
  caption: string;
  footer: string;
  headline: string;
  subheadline: string;
};

export const printTemplates: Array<{
  id: PrintTemplateId;
  name: string;
}> = [
  { id: "original", name: "Original QR" },
  { id: "plain", name: "Plain QR" },
  { id: "framed", name: "Clean Frame" },
  { id: "sketch", name: "Sketch" },
  { id: "sunrise", name: "Warm Menu" },
  { id: "elegant", name: "Elegant" },
  { id: "checker", name: "Checker" },
];

export function getDefaultTemplateText(
  templateId: PrintTemplateId,
  menu: MenuRecord,
): PrintTemplateText {
  switch (templateId) {
    case "original":
      return {
        headline: "",
        subheadline: "",
        caption: "",
        footer: "",
      };
    case "framed":
      return {
        headline: "SCAN HERE",
        subheadline: "OPEN DIGITAL MENU",
        caption: "Scan to open our digital menu",
        footer: menu.restaurantName,
      };
    case "sketch":
      return {
        headline: "SCAN HERE",
        subheadline: "VIEW FULL DOCUMENT",
        caption: "Open the document instantly",
        footer: menu.restaurantName,
      };
    case "sunrise":
      return {
        headline: "OPEN MENU",
        subheadline: menu.restaurantName,
        caption: "Scan to view the full menu",
        footer: menu.restaurantName,
      };
    case "elegant":
      return {
        headline: "Order Online",
        subheadline: menu.restaurantName,
        caption: "Scan the QR code to see our full menu",
        footer: menu.restaurantName,
      };
    case "checker":
      return {
        headline: "SCAN HERE",
        subheadline: "TO VIEW MENU",
        caption: "Open the digital menu instantly",
        footer: menu.restaurantName,
      };
    case "plain":
    default:
      return {
        headline: menu.title,
        subheadline: menu.restaurantName,
        caption: "Scan to open this PDF",
        footer: menu.restaurantName,
      };
  }
}

export function mergeTemplateText(
  defaults: PrintTemplateText,
  stored?: Partial<PrintTemplateText>,
) {
  return {
    caption: stored?.caption ?? defaults.caption,
    footer: stored?.footer ?? defaults.footer,
    headline: stored?.headline ?? defaults.headline,
    subheadline: stored?.subheadline ?? defaults.subheadline,
  };
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clampText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function svgText(
  value: string,
  x: number,
  y: number,
  size: number,
  color: string,
  weight = 700,
  anchor = "middle",
  family = "Arial, Helvetica, sans-serif",
) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeSvgText(value)}</text>`;
}

export function getPrintTemplateSvg({
  design,
  menu,
  publicUrl,
  templateId,
  text,
}: {
  design: QrDesign;
  menu: MenuRecord;
  publicUrl: string;
  templateId: PrintTemplateId;
  text: PrintTemplateText;
}) {
  const width = 900;
  const height = 1260;
  const qrData = getStyledQrDataUrl(publicUrl, design);
  const title = clampText(text.headline || menu.title, 28);
  const subtitle = clampText(text.subheadline, 42);
  const caption = clampText(text.caption, 56);
  const footer = clampText(text.footer, 70);

  if (templateId === "original") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <image href="${qrData}" x="110" y="290" width="680" height="680"/>
    </svg>`;
  }

  if (templateId === "plain") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" rx="36" fill="#ffffff"/>
      ${svgText(title, 450, 150, 58, "#151924", 800)}
      ${svgText(subtitle, 450, 210, 28, "#5f6673", 700)}
      <rect x="160" y="280" width="580" height="580" rx="28" fill="#f8fafc" stroke="#dbe2ea" stroke-width="3"/>
      <image href="${qrData}" x="205" y="325" width="490" height="490"/>
      ${svgText(caption, 450, 960, 36, "#151924", 800)}
      ${svgText(footer, 450, 1030, 24, "#5f6673", 600)}
    </svg>`;
  }

  if (templateId === "framed") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#f6e8e0"/>
      <rect x="58" y="370" width="784" height="760" fill="none" stroke="#5a2012" stroke-width="4"/>
      <path d="M95 140h-80M805 140h80" stroke="#5a2012" stroke-width="4"/>
      ${svgText(title, 450, 120, 105, "#5a2012", 900, "middle", "Impact, Arial Black, Arial, sans-serif")}
      ${svgText(subtitle, 450, 190, 34, "#5a2012", 800)}
      <path d="M95 410h80M95 410v80M805 410h-80M805 410v80M95 1040h80M95 1040v-80M805 1040h-80M805 1040v-80" stroke="#5a2012" stroke-width="4" fill="none"/>
      <rect x="250" y="485" width="400" height="400" rx="20" fill="${design.backgroundColor}"/>
      <image href="${qrData}" x="270" y="505" width="360" height="360"/>
      ${svgText(caption, 450, 950, 32, "#5a2012", 800)}
      ${svgText(footer, 450, 1140, 22, "#5a2012", 600)}
    </svg>`;
  }

  if (templateId === "sketch") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#f4f4f2"/>
      <path d="M0 170L440 0H0Z" fill="#050505"/>
      <path d="M900 1110L520 1260H900Z" fill="#050505"/>
      <path d="M650 160l38-96 38 14-38 96zM740 205l82-56 24 32-84 58zM780 275l100 26-11 42-100-27z" fill="none" stroke="#050505" stroke-width="12" stroke-linejoin="round"/>
      ${svgText(title, 450, 305, 72, "#050505", 900, "middle", "Comic Sans MS, Trebuchet MS, Arial, sans-serif")}
      <rect x="170" y="390" width="560" height="560" rx="34" fill="#050505"/>
      <rect x="235" y="455" width="430" height="430" rx="22" fill="${design.backgroundColor}"/>
      <image href="${qrData}" x="260" y="480" width="380" height="380"/>
      ${svgText(subtitle, 450, 995, 28, "#050505", 800)}
      ${svgText(caption, 450, 1060, 28, "#050505", 700)}
      ${svgText(footer, 450, 1115, 22, "#050505", 700)}
    </svg>`;
  }

  if (templateId === "sunrise") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" rx="28" fill="#ffe5a3"/>
      <path d="M0 550C170 725 300 725 450 550C600 375 730 375 900 550V1260H0Z" fill="#ffd10a"/>
      ${svgText(title, 450, 250, 78, "#f45a2a", 900, "middle", "Arial Black, Arial, sans-serif")}
      ${svgText(subtitle, 450, 130, 30, "#f45a2a", 700, "middle", "Georgia, serif")}
      <rect x="190" y="330" width="520" height="520" rx="40" fill="#fff8df" stroke="#f45a2a" stroke-width="5"/>
      <image href="${qrData}" x="245" y="385" width="410" height="410"/>
      ${svgText(caption, 450, 1015, 44, "#f45a2a", 900)}
      ${svgText(footer, 450, 1070, 28, "#d85a35", 600)}
    </svg>`;
  }

  if (templateId === "elegant") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#f8f8f5"/>
      <path d="M310 80h500v1060H90V290C190 270 280 180 310 80Z" fill="none" stroke="#c7ccb0" stroke-width="4"/>
      ${svgText(subtitle, 145, 170, 34, "#777d62", 700, "middle", "Georgia, serif")}
      ${svgText(title, 650, 185, 72, "#777d62", 500, "middle", "Georgia, serif")}
      <rect x="220" y="350" width="460" height="460" rx="12" fill="${design.backgroundColor}"/>
      <image href="${qrData}" x="245" y="375" width="410" height="410"/>
      ${svgText(caption, 450, 900, 31, "#777d62", 500, "middle", "Georgia, serif")}
      <rect x="220" y="990" width="460" height="54" rx="27" fill="#ffffff" stroke="#dce1bf" stroke-width="3"/>
      ${svgText(footer, 450, 1025, 20, "#777d62", 500, "middle", "Georgia, serif")}
    </svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs><pattern id="checks" width="180" height="180" patternUnits="userSpaceOnUse"><rect width="90" height="90" fill="#30302f"/><rect x="90" y="90" width="90" height="90" fill="#30302f"/><rect x="90" width="90" height="90" fill="#d7d0c3"/><rect y="90" width="90" height="90" fill="#d7d0c3"/><circle cx="24" cy="24" r="3" fill="#767064"/><circle cx="135" cy="128" r="3" fill="#767064"/></pattern></defs>
    <rect width="100%" height="100%" fill="url(#checks)"/>
    <rect x="70" y="70" width="760" height="1120" rx="28" fill="#30302f" opacity=".18"/>
    ${svgText(title, 450, 250, 100, "#f1e8d8", 900, "middle", "Georgia, serif")}
    <rect x="325" y="275" width="250" height="62" rx="31" fill="#f1e8d8"/>
    ${svgText(subtitle, 450, 314, 22, "#30302f", 800)}
    <rect x="135" y="405" width="630" height="650" rx="42" fill="#30302f" stroke="#f1e8d8" stroke-width="3"/>
    <rect x="240" y="500" width="420" height="420" rx="20" fill="${design.backgroundColor}"/>
    <image href="${qrData}" x="265" y="525" width="370" height="370"/>
    ${svgText(caption, 450, 990, 42, "#f1e8d8", 800, "middle", "Georgia, serif")}
    <path d="M135 1060h630" stroke="#d0c3ad" stroke-width="3"/>
    ${svgText(footer, 450, 1115, 19, "#f1e8d8", 700)}
  </svg>`;
}

export async function downloadPrintTemplatePng({
  design,
  filename,
  menu,
  publicUrl,
  templateId,
  text,
}: {
  design: QrDesign;
  filename: string;
  menu: MenuRecord;
  publicUrl: string;
  templateId: PrintTemplateId;
  text: PrintTemplateText;
}) {
  const image = new Image();
  const svg = getPrintTemplateSvg({ design, menu, publicUrl, templateId, text });
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not render print template."));
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = 1800;
  canvas.height = 2520;
  const context = canvas.getContext("2d");
  if (!context) return;

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = filename;
  link.click();
}

function TemplateText({
  children,
  className = "",
  style,
}: {
  children: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <p className={`min-w-0 break-words text-center leading-tight ${className}`} style={style}>
      {children}
    </p>
  );
}

export function PrintTemplateCard({
  design,
  menu,
  publicUrl,
  templateId,
  text,
}: {
  design: QrDesign;
  menu: MenuRecord;
  publicUrl: string;
  templateId: PrintTemplateId;
  text: PrintTemplateText;
}) {
  if (templateId === "plain") {
    return (
      <div className="qr-template-card flex aspect-[5/7] h-full w-full flex-col items-center justify-between rounded-xl bg-white p-[7%] text-[#151924]">
        <div className="w-full">
          <TemplateText className="text-[clamp(1.05rem,8cqw,2.3rem)] font-black">
            {text.headline}
          </TemplateText>
          <TemplateText className="mt-[3%] text-[clamp(.65rem,3cqw,1rem)] font-bold text-[#5f6673]">
            {text.subheadline}
          </TemplateText>
        </div>
        <div className="w-[76%] rounded-xl border border-[#dbe2ea] bg-[#f8fafc] p-[5%]">
          <StyledQrCode
            value={publicUrl}
            design={design}
            title={`${menu.title} QR code`}
            className="aspect-square w-full"
          />
        </div>
        <div className="w-full">
          <TemplateText className="text-[clamp(.75rem,3.6cqw,1.12rem)] font-extrabold">
            {text.caption}
          </TemplateText>
          <TemplateText className="mt-[3%] text-[clamp(.5rem,2.3cqw,.76rem)] font-semibold text-[#5f6673]">
            {text.footer}
          </TemplateText>
        </div>
      </div>
    );
  }

  if (templateId === "framed") {
    return (
      <div className="qr-template-card relative flex aspect-[5/7] h-full w-full flex-col items-center bg-[#f6e8e0] p-[6%] text-[#5a2012]">
        <TemplateText
          className="font-black uppercase"
          style={{ fontFamily: "Impact, Arial Black, sans-serif", fontSize: "clamp(2rem, 16cqw, 5.2rem)" }}
        >
          {text.headline}
        </TemplateText>
        <div className="mt-[2%] flex w-full items-center gap-[5%]">
          <span className="h-px flex-1 bg-[#5a2012]" />
          <TemplateText className="text-[clamp(.7rem,4.3cqw,1.35rem)] font-black uppercase">
            {text.subheadline}
          </TemplateText>
          <span className="h-px flex-1 bg-[#5a2012]" />
        </div>
        <div className="relative mt-[7%] flex w-full flex-1 items-center justify-center border-2 border-[#5a2012] p-[12%]">
          <span className="absolute left-[4%] top-[4%] h-[13%] w-[13%] border-l-2 border-t-2 border-[#5a2012]" />
          <span className="absolute right-[4%] top-[4%] h-[13%] w-[13%] border-r-2 border-t-2 border-[#5a2012]" />
          <span className="absolute bottom-[4%] left-[4%] h-[13%] w-[13%] border-b-2 border-l-2 border-[#5a2012]" />
          <span className="absolute bottom-[4%] right-[4%] h-[13%] w-[13%] border-b-2 border-r-2 border-[#5a2012]" />
          <StyledQrCode value={publicUrl} design={design} className="aspect-square w-[78%]" />
          <TemplateText className="absolute bottom-[14%] text-[clamp(.65rem,3.5cqw,1.1rem)] font-bold">
            {text.caption}
          </TemplateText>
        </div>
        <TemplateText className="mt-[3%] text-[clamp(.48rem,2.3cqw,.72rem)] font-semibold">
          {text.footer}
        </TemplateText>
      </div>
    );
  }

  if (templateId === "sketch") {
    return (
      <div className="qr-template-card relative flex aspect-[5/7] h-full w-full flex-col items-center overflow-hidden bg-[#f4f4f2] p-[9%] text-black">
        <div className="absolute left-0 top-0 h-[15%] w-[60%] -skew-y-[22deg] bg-black" />
        <div className="absolute bottom-0 right-0 h-[15%] w-[58%] -skew-y-[22deg] bg-black" />
        <div className="mt-[15%] w-full">
          <TemplateText
            className="font-black uppercase"
            style={{ fontFamily: "Comic Sans MS, Trebuchet MS, sans-serif", fontSize: "clamp(1.4rem, 10cqw, 3.2rem)" }}
          >
            {text.headline}
          </TemplateText>
          <TemplateText className="mt-[3%] text-[clamp(.52rem,3cqw,.9rem)] font-black uppercase">
            {text.subheadline}
          </TemplateText>
        </div>
        <div className="mt-[8%] flex w-[76%] items-center justify-center rounded-2xl bg-black p-[9%]">
          <StyledQrCode value={publicUrl} design={design} className="aspect-square w-full" />
        </div>
        <TemplateText className="mt-[8%] text-[clamp(.6rem,3.4cqw,1rem)] font-black">
          {text.caption}
        </TemplateText>
        <TemplateText className="mt-[4%] text-[clamp(.48rem,2.5cqw,.72rem)] font-bold">
          {text.footer}
        </TemplateText>
      </div>
    );
  }

  if (templateId === "sunrise") {
    return (
      <div className="qr-template-card relative flex aspect-[5/7] h-full w-full flex-col items-center overflow-hidden rounded-xl bg-[#ffe5a3] p-[8%] text-[#f45a2a]">
        <div className="absolute bottom-0 h-[55%] w-[130%] rounded-t-[100%] bg-[#ffd10a]" />
        <TemplateText className="relative mt-[8%] text-[clamp(.5rem,3cqw,.9rem)] font-bold">
          {text.subheadline}
        </TemplateText>
        <TemplateText className="relative mt-[6%] text-[clamp(1.45rem,11cqw,3.4rem)] font-black uppercase">
          {text.headline}
        </TemplateText>
        <div className="relative mt-[10%] w-[74%] rounded-2xl border-2 border-[#f45a2a] bg-[#fff8df] p-[6%]">
          <StyledQrCode value={publicUrl} design={design} className="aspect-square w-full" />
        </div>
        <TemplateText className="relative mt-auto text-[clamp(.86rem,5cqw,1.55rem)] font-black uppercase">
          {text.caption}
        </TemplateText>
        <TemplateText className="relative mt-[2%] text-[clamp(.5rem,2.5cqw,.8rem)] font-semibold text-[#d85a35]">
          {text.footer}
        </TemplateText>
      </div>
    );
  }

  if (templateId === "elegant") {
    return (
      <div className="qr-template-card relative flex aspect-[5/7] h-full w-full flex-col items-center bg-[#f8f8f5] p-[9%] text-[#777d62]">
        <div className="absolute inset-[7%] rounded-tl-[36%] border-2 border-[#c7ccb0]" />
        <div className="relative flex w-full items-start justify-between gap-[8%]">
          <TemplateText className="max-w-[35%] text-[clamp(.6rem,3.5cqw,1.05rem)] font-semibold uppercase">
            {text.subheadline}
          </TemplateText>
          <TemplateText
            className="max-w-[55%]"
            style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.15rem,8cqw,2.6rem)" }}
          >
            {text.headline}
          </TemplateText>
        </div>
        <div className="relative mt-[18%] w-[70%]">
          <StyledQrCode value={publicUrl} design={design} className="aspect-square w-full" />
        </div>
        <TemplateText
          className="relative mt-[9%] text-[clamp(.58rem,3.4cqw,1rem)]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {text.caption}
        </TemplateText>
        <TemplateText className="relative mt-[8%] max-w-[78%] rounded-full border border-[#dce1bf] bg-white px-[5%] py-[2%] text-[clamp(.42rem,2.1cqw,.64rem)]">
          {text.footer}
        </TemplateText>
      </div>
    );
  }

  return (
    <div
      className="qr-template-card relative flex aspect-[5/7] h-full w-full flex-col items-center overflow-hidden p-[8%] text-[#f1e8d8]"
      style={{
        backgroundColor: "#d7d0c3",
        backgroundImage:
          "linear-gradient(45deg,#30302f 25%,transparent 25%),linear-gradient(-45deg,#30302f 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#30302f 75%),linear-gradient(-45deg,transparent 75%,#30302f 75%)",
        backgroundPosition: "0 0,0 90px,90px -90px,-90px 0",
        backgroundSize: "180px 180px",
      }}
    >
      <TemplateText
        className="mt-[10%] font-black uppercase drop-shadow"
        style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.6rem,12cqw,3.8rem)" }}
      >
        {text.headline}
      </TemplateText>
      <TemplateText className="-mt-[3%] rounded-full bg-[#f1e8d8] px-[6%] py-[2%] text-[clamp(.48rem,2.6cqw,.8rem)] font-black uppercase text-[#30302f]">
        {text.subheadline}
      </TemplateText>
      <div className="mt-[10%] flex w-[80%] flex-1 flex-col items-center justify-center rounded-2xl border border-[#f1e8d8] bg-[#30302f] p-[9%]">
        <StyledQrCode value={publicUrl} design={design} className="aspect-square w-full" />
        <TemplateText className="mt-[10%] text-[clamp(.78rem,4.8cqw,1.45rem)] font-black" style={{ fontFamily: "Georgia, serif" }}>
          {text.caption}
        </TemplateText>
      </div>
      <TemplateText className="mt-[4%] text-[clamp(.42rem,2.1cqw,.65rem)] font-bold">
        {text.footer}
      </TemplateText>
    </div>
  );
}
