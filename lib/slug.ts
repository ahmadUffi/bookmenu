export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export function uniqueSlug(name: string) {
  const base = slugify(name) || "restaurant-menu";
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}
