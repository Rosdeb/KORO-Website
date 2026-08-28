import { useMemo } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { translationsApi } from "@/lib/api/endpoints";
import { mapTranslation, toLanguageMap } from "@/lib/api/mappers";
import type { LanguageMap } from "@/lib/api/mappers";
import { slugify } from "@/lib/utils/slugify";
import { useDebouncedValue } from "@/lib/utils/use-debounced-value";
import { fetchLanguages, useLanguages } from "@/features/languages/hooks";
import { useCategories } from "@/features/dictionary/hooks";
import type { QueryClient } from "@tanstack/react-query";
import type { RawTranslation } from "@/lib/api/raw-types";
import type { Concept } from "@/types";

// The backend search endpoint returns a *flat* list of translation rows. Group
// them by concept so each result renders as one card (same shape ConceptCard
// consumes). Slugs aren't in the payload — derive them with `slugify`, exactly
// as the concept/category mappers do.
function groupByConcept(rows: RawTranslation[], languages: LanguageMap): Concept[] {
  const byConcept = new Map<string, Concept>();
  for (const row of rows) {
    let concept = byConcept.get(row.conceptId);
    if (!concept) {
      concept = {
        id: row.conceptId,
        slug: slugify(row.conceptName),
        name: row.conceptName,
        description: null,
        categoryId: "",
        categoryName: row.categoryName,
        categorySlug: slugify(row.categoryName),
        imageUrl: null,
        translations: [],
      };
      byConcept.set(row.conceptId, concept);
    }
    concept.translations.push(mapTranslation(row, languages));
  }
  return [...byConcept.values()];
}

async function runDictionarySearch(
  qc: QueryClient,
  query: string,
  opts: { sourceLanguageId?: string; targetLanguageId?: string },
): Promise<Concept[]> {
  const [languages, rows] = await Promise.all([
    qc.ensureQueryData({ queryKey: ["languages"], queryFn: fetchLanguages, staleTime: 5 * 60 * 1000 }),
    translationsApi.search({
      query,
      ...(opts.sourceLanguageId ? { sourceLanguageId: opts.sourceLanguageId } : {}),
      ...(opts.targetLanguageId ? { targetLanguageId: opts.targetLanguageId } : {}),
    }),
  ]);
  return groupByConcept(rows, toLanguageMap(languages));
}

/**
 * Concept/translation search backed by the real `POST /api/v1/translations/search`
 * endpoint (public, Unicode-normalized, matches text + pronunciation + concept
 * name). The query is debounced ~300 ms and the call is skipped while it is
 * empty. Pass `targetLanguageId` to scope to one language, or `sourceLanguageId`
 * + `targetLanguageId` for "type a word in language A, get language B".
 */
export function useDictionarySearch(
  query: string,
  opts?: { sourceLanguageId?: string; targetLanguageId?: string },
) {
  const qc = useQueryClient();
  const debounced = useDebouncedValue(query, 300);
  const trimmed = debounced.trim();
  const sourceLanguageId = opts?.sourceLanguageId;
  const targetLanguageId = opts?.targetLanguageId;

  return useQuery({
    queryKey: ["translations", "search", trimmed, targetLanguageId ?? null, sourceLanguageId ?? null],
    queryFn: () => runDictionarySearch(qc, trimmed, { sourceLanguageId, targetLanguageId }),
    enabled: trimmed.length > 0,
    staleTime: 60 * 1000,
    // Keep the last results on screen while the next query runs, so refining a
    // search doesn't flash an empty list. `isFetching` still signals the load.
    placeholderData: keepPreviousData,
  });
}

// Languages and Categories aren't part of the search endpoint, so those two
// sections stay a client-side substring filter over the already-cached lists.
// Concepts & translations now go through useDictionarySearch (the real backend
// search) instead of downloading every concept and filtering in the browser.
export function useGlobalSearch(query: string) {
  const languages = useLanguages();
  const categories = useCategories();
  const conceptSearch = useDictionarySearch(query);

  const q = query.trim().toLowerCase();

  const data = useMemo(() => {
    if (!q) return { languages: [], categories: [], concepts: [] };
    return {
      languages: (languages.data ?? []).filter(
        (l) => l.name.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q) || l.code.toLowerCase() === q,
      ),
      categories: (categories.data ?? []).filter((c) => c.name.toLowerCase().includes(q)),
      concepts: conceptSearch.data ?? [],
    };
  }, [q, languages.data, categories.data, conceptSearch.data]);

  return {
    data,
    // Keep showing the loading state through the debounce gap, before the
    // search query has resolved its first result.
    isLoading:
      languages.isLoading ||
      categories.isLoading ||
      (!!q && !conceptSearch.data && !conceptSearch.isError),
    isFetching: languages.isFetching || categories.isFetching || conceptSearch.isFetching,
    isError: languages.isError || categories.isError || conceptSearch.isError,
    refetch: () => {
      languages.refetch();
      categories.refetch();
      conceptSearch.refetch();
    },
  };
}
