import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, conceptsApi, translationsApi } from "@/lib/api/endpoints";
import { mapCategory, mapConceptPage, mapTranslation, toLanguageMap } from "@/lib/api/mappers";
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

export function useConcept(categorySlug: string, conceptSlug: string) {
  const qc = useQueryClient();
  const categories = useCategories();
  const categoryId = categories.data?.find((category) => category.slug === categorySlug)?.id;
  const query = useQuery({
    queryKey: ["concepts", "detail", categoryId, conceptSlug],
    queryFn: async () => {
      const firstPage = await fetchConceptPage(qc, { categoryId, page: 0, size: 20 });
      let concept = firstPage.content.find((item) => item.slug === conceptSlug);
      for (let page = 1; !concept && page < firstPage.totalPages; page += 1) {
        const nextPage = await fetchConceptPage(qc, { categoryId, page, size: 20 });
        concept = nextPage.content.find((item) => item.slug === conceptSlug);
      }
      if (!concept) return undefined;
      const [languages, rawTranslations] = await Promise.all([
        qc.ensureQueryData({ queryKey: ["languages"], queryFn: fetchLanguages, staleTime: 5 * 60 * 1000 }),
        translationsApi.list({ conceptId: concept.id }),
      ]);
      const languageMap = toLanguageMap(languages);
      return { ...concept, translations: rawTranslations.map((translation) => mapTranslation(translation, languageMap)) };
    },
    enabled: !!categoryId,
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
