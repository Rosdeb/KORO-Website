import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { imagesApi } from "@/lib/api/endpoints";
import { mapScanResult, toLanguageMap } from "@/lib/api/mappers";
import { fetchLanguages } from "@/features/languages/hooks";

async function withLanguageMap(qc: QueryClient) {
  const languages = await qc.ensureQueryData({ queryKey: ["languages"], queryFn: fetchLanguages, staleTime: 5 * 60 * 1000 });
  return toLanguageMap(languages);
}

export function useRecognizeImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const [raw, languageMap] = await Promise.all([imagesApi.recognize(file), withLanguageMap(qc)]);
      return mapScanResult(raw, languageMap);
    },
  });
}

export function useScanHistory() {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["scan-history"],
    queryFn: async () => {
      const [raw, languageMap] = await Promise.all([imagesApi.history(), withLanguageMap(qc)]);
      return raw.map((r) => mapScanResult(r, languageMap));
    },
  });
}
