import type { MetadataRoute } from "next";
import type {
  RawCategory,
  RawConcept,
  RawLanguage,
} from "@/lib/api/raw-types";
import { getSiteUrl } from "@/lib/site-url";
import { slugify } from "@/lib/utils/slugify";
import { backendBaseUrl } from "@/lib/api/server-auth";

async function publicRecords<T>(resource: string): Promise<T[]> {
  const apiUrl = backendBaseUrl();

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/$/, "")}/api/v1/${resource}`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) return [];

    const records: unknown = await response.json();

    return Array.isArray(records) ? (records as T[]) : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [siteUrl, languages, categories, concepts] = await Promise.all([
    getSiteUrl(),
    publicRecords<RawLanguage>("languages"),
    publicRecords<RawCategory>("categories"),
    publicRecords<RawConcept>("concepts"),
  ]);

  const paths = new Set([
    "/",
    "/about",
    "/languages",
    "/dictionary",
    "/leaderboard",
  ]);

  for (const language of languages) {
    if (language.code) {
      paths.add(`/languages/${encodeURIComponent(language.code)}`);
    }
  }

  for (const category of categories) {
    const slug = slugify(category.name);

    if (slug) {
      paths.add(`/dictionary/${slug}`);
    }
  }

  for (const concept of concepts) {
    const categorySlug = slugify(concept.category?.name ?? "");
    const conceptSlug = slugify(concept.name);

    if (categorySlug && conceptSlug) {
      paths.add(`/dictionary/${categorySlug}/${conceptSlug}`);
    }
  }

  return Array.from(paths, (path) => ({
    url: new URL(path, siteUrl).href,
  }));
}