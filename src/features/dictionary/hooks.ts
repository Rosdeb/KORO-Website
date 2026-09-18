import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, conceptsApi, translationsApi } from "@/lib/api/endpoints";
import { mapCategory, mapConcept, mapConceptPage, mapTranslation, toLanguageMap } from "@/lib/api/mappers";
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

export function useTranslationsCount() {
  return useQuery({
    queryKey: ["translations-count"],
    queryFn: translationsApi.count,
    staleTime: 5 * 60 * 1000,
  });
}

async function fetchConceptPage(qc: QueryClient, params: { categoryId?: string; page: number; size: number }) {
  const [languages, rawConcepts] = await Promise.all([
    qc.ensureQueryData({ queryKey: ["languages"], queryFn: fetchLanguages, staleTime: 5 * 60 * 1000 }),
    conceptsApi.list(params),
  ]);
  const languageMap = toLanguageMap(languages);
  return mapConceptPage(rawConcepts, languageMap);
}

// Browse list for a category page. Text search is handled separately by
// useDictionarySearch, which hits the real backend POST /translations/search
// (matches Bangla, pronunciation and source-language words, not just the
// English concept name).
export function useConceptsByCategory(categorySlug: string, page = 0, size = 20) {
  const qc = useQueryClient();
  const categories = useCategories();
  const categoryId = categories.data?.find((category) => category.slug === categorySlug)?.id;
  const query = useQuery({
    queryKey: ["concepts", "category", categoryId, page, size],
    queryFn: () => fetchConceptPage(qc, { categoryId, page, size }),
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
  return { ...query, data: query.data?.content ?? [], page: query.data };
}

export function useConcept(conceptId: string) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["concepts", "detail", conceptId],
    queryFn: async () => {
      const [languages, rawConcept] = await Promise.all([
        qc.ensureQueryData({ queryKey: ["languages"], queryFn: fetchLanguages, staleTime: 5 * 60 * 1000 }),
        conceptsApi.getById(conceptId),
      ]);
      const languageMap = toLanguageMap(languages);
      const concept = mapConcept(rawConcept, [], languageMap);
      const rawTranslations = await translationsApi.list({ conceptId: concept.id });
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
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["concepts", "popular", limit],
    queryFn: async () => (await fetchConceptPage(qc, { page: 0, size: Math.max(20, limit) })).content.slice(0, limit),
    staleTime: 2 * 60 * 1000,
  });
  return query;
}

export { slugify };
