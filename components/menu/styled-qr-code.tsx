"use client";

import QRCode from "qrcode";

export type QrPieceShape = "square" | "rounded" | "dots" | "classy" | "extra-rounded";
export type QrEyeShape = "square" | "rounded" | "dot" | "extra-rounded";

export type QrDesign = {
  backgroundColor: string;
  eyeColor: string;
  eyeShape: QrEyeShape;
  foregroundColor: string;
  logoDataUrl?: string;
  pieceShape: QrPieceShape;
  quietZone: number;
};

export const defaultQrDesign: QrDesign = {
  backgroundColor: "#ffffff",
  eyeColor: "#151924",
  eyeShape: "extra-rounded",
  foregroundColor: "#151924",
  pieceShape: "rounded",
  quietZone: 3,
};

type StyledQrCodeProps = {
  className?: string;
  design?: QrDesign;
  title?: string;
  value: string;
};

function isFinder(row: number, col: number, size: number) {
  const inTop = row < 7;
  const inBottom = row >= size - 7;
  const inLeft = col < 7;
  const inRight = col >= size - 7;

  return (inTop && inLeft) || (inTop && inRight) || (inBottom && inLeft);
}

function roundedForShape(shape: QrPieceShape | QrEyeShape, unit: number) {
  if (shape === "dots" || shape === "dot") return unit / 2;
  if (shape === "extra-rounded") return unit * 0.38;
  if (shape === "rounded" || shape === "classy") return unit * 0.24;
  return 0;
}

function moduleProps(shape: QrPieceShape, unit: number) {
  const inset = shape === "dots" ? unit * 0.14 : shape === "classy" ? unit * 0.06 : 0;
  const size = unit - inset * 2;
  const radius = roundedForShape(shape, size);

  return { inset, radius, size };
}

function renderEye(
  key: string,
  x: number,
  y: number,
  unit: number,
  design: QrDesign,
) {
  const outer = unit * 7;
  const middle = unit * 5;
  const inner = unit * 3;
  const outerRadius = roundedForShape(design.eyeShape, outer);
  const middleRadius = roundedForShape(design.eyeShape, middle);
  const innerRadius = roundedForShape(design.eyeShape, inner);

  return (
    <g key={key}>
      <rect
        x={x}
        y={y}
        width={outer}
        height={outer}
        rx={outerRadius}
        fill={design.eyeColor}
      />
      <rect
        x={x + unit}
        y={y + unit}
        width={middle}
        height={middle}
        rx={middleRadius}
        fill={design.backgroundColor}
      />
      <rect
        x={x + unit * 2}
        y={y + unit * 2}
        width={inner}
        height={inner}
        rx={innerRadius}
        fill={design.eyeColor}
      />
    </g>
  );
}

export function getStyledQrSvg(value: string, design: QrDesign = defaultQrDesign) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "H" });
  const size = qr.modules.size;
  const quietZone = design.quietZone;
  const totalModules = size + quietZone * 2;
  const unit = 16;
  const imageSize = totalModules * unit;
  const { inset, radius, size: pieceSize } = moduleProps(design.pieceShape, unit);
  const rects: string[] = [];

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!qr.modules.get(row, col) || isFinder(row, col, size)) continue;
      const x = (col + quietZone) * unit + inset;
      const y = (row + quietZone) * unit + inset;
      rects.push(
        `<rect x="${x}" y="${y}" width="${pieceSize}" height="${pieceSize}" rx="${radius}" fill="${design.foregroundColor}"/>`,
      );
    }
  }

  const eyes = [
    [quietZone * unit, quietZone * unit],
    [(quietZone + size - 7) * unit, quietZone * unit],
    [quietZone * unit, (quietZone + size - 7) * unit],
  ]
    .map(([x, y]) => {
      const outer = unit * 7;
      const middle = unit * 5;
      const inner = unit * 3;
      const outerRadius = roundedForShape(design.eyeShape, outer);
      const middleRadius = roundedForShape(design.eyeShape, middle);
      const innerRadius = roundedForShape(design.eyeShape, inner);

      return [
        `<rect x="${x}" y="${y}" width="${outer}" height="${outer}" rx="${outerRadius}" fill="${design.eyeColor}"/>`,
        `<rect x="${x + unit}" y="${y + unit}" width="${middle}" height="${middle}" rx="${middleRadius}" fill="${design.backgroundColor}"/>`,
        `<rect x="${x + unit * 2}" y="${y + unit * 2}" width="${inner}" height="${inner}" rx="${innerRadius}" fill="${design.eyeColor}"/>`,
      ].join("");
    })
    .join("");
  const logoSize = imageSize * 0.22;
  const logoX = (imageSize - logoSize) / 2;
  const logoBackgroundSize = logoSize * 1.22;
  const logoBackgroundX = (imageSize - logoBackgroundSize) / 2;
  const logo = design.logoDataUrl
    ? `<rect x="${logoBackgroundX}" y="${logoBackgroundX}" width="${logoBackgroundSize}" height="${logoBackgroundSize}" rx="${logoBackgroundSize * 0.18}" fill="${design.backgroundColor}"/><image href="${design.logoDataUrl}" x="${logoX}" y="${logoX}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${imageSize} ${imageSize}" width="${imageSize}" height="${imageSize}"><rect width="100%" height="100%" fill="${design.backgroundColor}"/>${rects.join("")}${eyes}${logo}</svg>`;
}

export function getStyledQrDataUrl(value: string, design: QrDesign = defaultQrDesign) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(getStyledQrSvg(value, design))}`;
}

export async function downloadStyledQrPng(
  value: string,
  design: QrDesign,
  filename: string,
  pixelSize = 1200,
) {
  const image = new Image();
  const svgUrl = getStyledQrDataUrl(value, design);

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not render QR image."));
    image.src = svgUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelSize;
  canvas.height = pixelSize;
  const context = canvas.getContext("2d");
  if (!context) return;

  context.fillStyle = design.backgroundColor;
  context.fillRect(0, 0, pixelSize, pixelSize);
  context.drawImage(image, 0, 0, pixelSize, pixelSize);

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = filename;
  link.click();
}

export default function StyledQrCode({
  className,
  design = defaultQrDesign,
  title = "QR code",
  value,
}: StyledQrCodeProps) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "H" });
  const size = qr.modules.size;
  const quietZone = design.quietZone;
  const totalModules = size + quietZone * 2;
  const unit = 1;
  const { inset, radius, size: pieceSize } = moduleProps(design.pieceShape, unit);
  const logoSize = totalModules * 0.22;
  const logoX = (totalModules - logoSize) / 2;
  const logoBackgroundSize = logoSize * 1.22;
  const logoBackgroundX = (totalModules - logoBackgroundSize) / 2;

  return (
    <svg
      aria-label={title}
      className={className}
      role="img"
      viewBox={`0 0 ${totalModules} ${totalModules}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100%" height="100%" fill={design.backgroundColor} />
      {Array.from({ length: size }).flatMap((_, row) =>
        Array.from({ length: size }).map((__, col) => {
          if (!qr.modules.get(row, col) || isFinder(row, col, size)) return null;
          const x = col + quietZone + inset;
          const y = row + quietZone + inset;

          return (
            <rect
              key={`${row}-${col}`}
              x={x}
              y={y}
              width={pieceSize}
              height={pieceSize}
              rx={radius}
              fill={design.foregroundColor}
            />
          );
        }),
      )}
      {renderEye("tl", quietZone, quietZone, unit, design)}
      {renderEye("tr", quietZone + size - 7, quietZone, unit, design)}
      {renderEye("bl", quietZone, quietZone + size - 7, unit, design)}
      {design.logoDataUrl ? (
        <>
          <rect
            x={logoBackgroundX}
            y={logoBackgroundX}
            width={logoBackgroundSize}
            height={logoBackgroundSize}
            rx={logoBackgroundSize * 0.18}
            fill={design.backgroundColor}
          />
          <image
            href={design.logoDataUrl}
            x={logoX}
            y={logoX}
            width={logoSize}
            height={logoSize}
            preserveAspectRatio="xMidYMid meet"
          />
        </>
      ) : null}
    </svg>
  );
}
