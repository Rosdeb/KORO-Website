import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, conceptsApi, translationsApi } from "@/lib/api/endpoints";
import { mapCategory, mapConcept, toLanguageMap } from "@/lib/api/mappers";
import { fetchLanguages } from "@/features/languages/hooks";
import { slugify } from "@/lib/utils/slugify";
import type { QueryClient } from "@tanstack/react-query";

async function fetchCategories() {
  const raw = await categoriesApi.list();
  return raw.map(mapCategory);
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });
}

async function fetchAllConcepts(qc: QueryClient) {
  const [languages, rawConcepts, rawTranslations] = await Promise.all([
    qc.ensureQueryData({ queryKey: ["languages"], queryFn: fetchLanguages, staleTime: 5 * 60 * 1000 }),
    conceptsApi.list(),
    translationsApi.list(),
  ]);
  const languageMap = toLanguageMap(languages);
  const translationsByConcept = new Map<string, typeof rawTranslations>();
  for (const t of rawTranslations) {
    const list = translationsByConcept.get(t.conceptId) ?? [];
    list.push(t);
    translationsByConcept.set(t.conceptId, list);
  }
  return rawConcepts.map((c) => mapConcept(c, translationsByConcept.get(c.id) ?? [], languageMap));
}

// The backend has no slug-based lookup or per-concept translation endpoint,
// so the dictionary is fetched as one joined list (concepts + all
// translations + languages) and sliced/filtered client-side. Fine at this
// dataset's scale; would need real pagination endpoints to scale further.
export function useAllConcepts() {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["concepts", "all"],
    queryFn: () => fetchAllConcepts(qc),
    staleTime: 2 * 60 * 1000,
  });
}

// Browse list for a category page. Text search is handled separately by
// useDictionarySearch, which hits the real backend POST /translations/search
// (matches Bangla, pronunciation and source-language words, not just the
// English concept name).
export function useConceptsByCategory(categorySlug: string) {
  const query = useAllConcepts();
  const filtered = (query.data ?? []).filter((c) => c.categorySlug === categorySlug);
  return { ...query, data: filtered };
}

export function useConcept(categorySlug: string, conceptSlug: string) {
  const query = useAllConcepts();
  const concept = query.data?.find((c) => c.categorySlug === categorySlug && c.slug === conceptSlug);
  return { ...query, data: concept };
}

// No popularity signal in the backend — surfaces the first few concepts as
// a reasonable stand-in for "popular".
export function usePopularConcepts(limit = 6) {
  const query = useAllConcepts();
  return { ...query, data: query.data?.slice(0, limit) };
}

export { slugify };
