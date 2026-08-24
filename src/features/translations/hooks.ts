import { useMutation } from "@tanstack/react-query";
import { translationsApi } from "@/lib/api/endpoints";

export function useTranslationSearch() {
  return useMutation({
    mutationFn: translationsApi.search,
  });
}
