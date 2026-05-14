export const uploadConfig = {
  maxPdfBytes: Number(process.env.NEXT_PUBLIC_MAX_PDF_UPLOAD_MB ?? 15) * 1024 * 1024,
  bucket: process.env.NEXT_PUBLIC_SUPABASE_MENU_BUCKET ?? "menus",
};

export function formatBytes(bytes: number) {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
}
