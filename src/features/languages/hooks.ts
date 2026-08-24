import { useQuery } from "@tanstack/react-query";
import { languagesApi } from "@/lib/api/endpoints";

export function useLanguages() {
  return useQuery({
    queryKey: ["languages"],
    queryFn: languagesApi.list,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLanguage(code: string) {
  return useQuery({
    queryKey: ["languages", code],
    queryFn: () => languagesApi.getByCode(code),
    enabled: !!code,
  });
}
