import { slugify } from "./slug";

export type DocumentSlugSource = {
  document_slug?: string | null;
  id: string;
  title: string;
};

export function getDocumentSlug(document: DocumentSlugSource) {
  if (document.document_slug) {
    return document.document_slug;
  }

  const base = slugify(document.title) || "document";
  return `${base}-${document.id.slice(0, 8)}`;
}
