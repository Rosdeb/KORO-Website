import { useMutation, useQuery } from "@tanstack/react-query";
import { imagesApi } from "@/lib/api/endpoints";

export function useRecognizeImage() {
  return useMutation({
    mutationFn: (file: File) => imagesApi.recognize(file),
  });
}

export function useScanHistory() {
  return useQuery({
    queryKey: ["scan-history"],
    queryFn: imagesApi.history,
  });
}
