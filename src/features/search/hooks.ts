import { useMemo } from "react";
import { useLanguages } from "@/features/languages/hooks";
import { useCategories, useAllConcepts } from "@/features/dictionary/hooks";

// The backend has no generic search endpoint, so results are composed
// client-side from the already-cached languages/categories/concepts lists,
// filtered by a case-insensitive substring match.
export function useGlobalSearch(query: string) {
  const languages = useLanguages();
  const categories = useCategories();
  const concepts = useAllConcepts();

  const q = query.trim().toLowerCase();

  const data = useMemo(() => {
    if (!q) return { languages: [], categories: [], concepts: [] };
    return {
      languages: (languages.data ?? []).filter(
        (l) => l.name.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q) || l.code.toLowerCase() === q,
      ),
      categories: (categories.data ?? []).filter((c) => c.name.toLowerCase().includes(q)),
      concepts: (concepts.data ?? []).filter(
        (c) => c.name.toLowerCase().includes(q) || c.translations.some((t) => t.text.toLowerCase().includes(q)),
      ),
    };
  }, [q, languages.data, categories.data, concepts.data]);

  return {
    data,
    isLoading: languages.isLoading || categories.isLoading || concepts.isLoading,
    isFetching: languages.isFetching || categories.isFetching || concepts.isFetching,
    isError: languages.isError || categories.isError || concepts.isError,
    refetch: () => {
      languages.refetch();
      categories.refetch();
      concepts.refetch();
    },
  };
}
