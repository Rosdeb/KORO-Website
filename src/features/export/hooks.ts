import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { exportApi } from "@/lib/api/endpoints";

export function useExportHistory() {
  return useQuery({
    queryKey: ["export-history"],
    queryFn: exportApi.history,
  });
}

export function useExportPdf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: exportApi.toPdf,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["export-history"] }),
  });
}
