import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, conceptsApi, translationsApi } from "@/lib/api/endpoints";
import { mapCategory, mapConcept, mapConceptPage, mapTranslation, toLanguageMap } from "@/lib/api/mappers";
import { fetchLanguages } from "@/features/languages/hooks";
import { slugify } from "@/lib/utils/slugify";

async function fetchCategories() {
  const raw = await categoriesApi.list();
  return raw.map(mapCategory);
}

export function useCategories(enabled = true) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTranslationsCount() {
  return useQuery({
    queryKey: ["translations-count"],
    queryFn: translationsApi.count,
    staleTime: 5 * 60 * 1000,
  });
}

async function fetchConceptPage(params: { categoryId?: string; page: number; size: number }, signal: AbortSignal) {
  const rawConcepts = await conceptsApi.list(params, signal);
  // List entries have no translations, so they do not need language metadata.
  return mapConceptPage(rawConcepts, new Map());
}

// Browse list for a category page. Text search is handled separately by
// useDictionarySearch, which hits the real backend POST /translations/search
// (matches Bangla, pronunciation and source-language words, not just the
// English concept name).
export function useConceptsByCategory(categorySlug: string, page = 0, size = 20) {
  const categories = useCategories();
  const categoryId = categories.data?.find((category) => category.slug === categorySlug)?.id;
  const query = useQuery({
    queryKey: ["concepts", "category", categoryId, page, size],
    queryFn: ({ signal }) => fetchConceptPage({ categoryId, page, size }, signal),
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
  return { ...query, data: query.data?.content ?? [], page: query.data };
}

export function useConcept(conceptId: string) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["concepts", "detail", conceptId],
    queryFn: async ({ signal }) => {
      const [languages, rawConcept, rawTranslations] = await Promise.all([
        qc.ensureQueryData({ queryKey: ["languages"], queryFn: fetchLanguages, staleTime: 5 * 60 * 1000 }),
        conceptsApi.getById(conceptId, signal),
        translationsApi.list({ conceptId }, signal),
      ]);
      const languageMap = toLanguageMap(languages);
      const concept = mapConcept(rawConcept, [], languageMap);
      return { ...concept, translations: rawTranslations.map((translation) => mapTranslation(translation, languageMap)) };
    },
    enabled: !!conceptId,
    staleTime: 2 * 60 * 1000,
  });
  return { ...query, data: query.data };
}

// No popularity signal in the backend — surfaces the first few concepts as
// a reasonable stand-in for "popular".
export function usePopularConcepts(limit = 6) {
  const query = useQuery({
    queryKey: ["concepts", "popular", limit],
    queryFn: async ({ signal }) => (await fetchConceptPage({ page: 0, size: limit }, signal)).content.slice(0, limit),
    staleTime: 2 * 60 * 1000,
  });
  return query;
}

export { slugify };
