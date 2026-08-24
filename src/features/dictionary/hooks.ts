import { useQuery } from "@tanstack/react-query";
import { categoriesApi, conceptsApi } from "@/lib/api/endpoints";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
    staleTime: 5 * 60 * 1000,
  });
}

export function useConceptsByCategory(categorySlug: string, params?: { q?: string; page?: number }) {
  return useQuery({
    queryKey: ["categories", categorySlug, "concepts", params],
    queryFn: () => conceptsApi.listByCategory(categorySlug, params),
    enabled: !!categorySlug,
  });
}

export function useConcept(categorySlug: string, conceptSlug: string) {
  return useQuery({
    queryKey: ["categories", categorySlug, "concepts", conceptSlug],
    queryFn: () => conceptsApi.getBySlug(categorySlug, conceptSlug),
    enabled: !!categorySlug && !!conceptSlug,
  });
}

export function usePopularConcepts() {
  return useQuery({
    queryKey: ["concepts", "popular"],
    queryFn: conceptsApi.popular,
    staleTime: 5 * 60 * 1000,
  });
}
