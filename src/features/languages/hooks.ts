import { useQuery } from "@tanstack/react-query";
import { languagesApi } from "@/lib/api/endpoints";
import { mapLanguage } from "@/lib/api/mappers";

export async function fetchLanguages() {
  const raw = await languagesApi.list();
  return raw.map(mapLanguage);
}

export function useLanguages() {
  return useQuery({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
    staleTime: 5 * 60 * 1000,
  });
}

// Shares the ["languages"] cache entry with useLanguages() so pages that use
// both (e.g. the language detail page alongside category lists) only fetch
// once — the backend has no GET /languages/{code} lookup, only by id.
export function useLanguage(code: string) {
  return useQuery({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
    staleTime: 5 * 60 * 1000,
    enabled: !!code,
    select: (languages) => languages.find((l) => l.code === code),
  });
}
