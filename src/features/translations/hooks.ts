import { useMutation, useQueryClient } from "@tanstack/react-query";
import { translationsApi } from "@/lib/api/endpoints";
import { mapTranslation, toLanguageMap } from "@/lib/api/mappers";
import { fetchLanguages } from "@/features/languages/hooks";
import { slugify } from "@/lib/utils/slugify";

export interface TranslationSearchResult {
  concept: { id: string; name: string; slug: string; categorySlug: string };
  translation: ReturnType<typeof mapTranslation>;
}

// The backend has no per-concept-detail endpoint reachable from a search
// result, so the concept's slug/categorySlug are derived from the flat
// conceptName/categoryName the search response already carries.
export function useTranslationSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      query: string;
      targetLanguageId: string;
      sourceLanguageId?: string;
    }): Promise<TranslationSearchResult[]> => {
      const languages = await queryClient.ensureQueryData({
        queryKey: ["languages"],
        queryFn: fetchLanguages,
        staleTime: 5 * 60 * 1000,
      });
      const languageMap = toLanguageMap(languages);
      const raw = await translationsApi.search(payload);
      return raw.map((t) => ({
        concept: {
          id: t.conceptId,
          name: t.conceptName,
          slug: slugify(t.conceptName),
          categorySlug: slugify(t.categoryName),
        },
        translation: mapTranslation(t, languageMap),
      }));
    },
  });
}
