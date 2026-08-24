/**
 * The backend identifies categories and concepts by Mongo ObjectId only —
 * no slug field. Routes still want readable paths (`/dictionary/nature`),
 * so we derive a slug from the name client-side and resolve it back to an
 * id by matching against the fetched list.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
