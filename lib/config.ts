export const uploadConfig = {
  maxPdfBytes: Number(process.env.NEXT_PUBLIC_MAX_PDF_UPLOAD_MB ?? 30) * 1024 * 1024,
  pdfCompressionThresholdBytes:
    Number(process.env.NEXT_PUBLIC_PDF_COMPRESSION_THRESHOLD_MB ?? 10) * 1024 * 1024,
  bucket: process.env.NEXT_PUBLIC_R2_BUCKET ?? "menus",
  storageProvider: "Cloudflare R2",
};

export const logoUploadConfig = {
  maxImageBytes: 5 * 1024 * 1024,
};

export function formatBytes(bytes: number) {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
}
