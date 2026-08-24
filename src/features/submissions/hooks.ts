import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { submissionsApi } from "@/lib/api/endpoints";

export function useMySubmissions() {
  return useQuery({
    queryKey: ["submissions", "mine"],
    queryFn: submissionsApi.mine,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submissionsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["submissions", "mine"] }),
  });
}
