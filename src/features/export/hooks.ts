import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { exportApi } from "@/lib/api/endpoints";
import { mapExportRecord } from "@/lib/api/mappers";

export function useExportHistory() {
  return useQuery({
    queryKey: ["export-history"],
    queryFn: async () => (await exportApi.history()).map(mapExportRecord),
  });
}

export function useExportPdf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { collectionId: string; languageId: string }) =>
      mapExportRecord(await exportApi.toPdf(payload)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["export-history"] }),
  });
}
