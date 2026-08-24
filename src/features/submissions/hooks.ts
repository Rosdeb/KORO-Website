import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { submissionsApi } from "@/lib/api/endpoints";
import { mapSubmission } from "@/lib/api/mappers";

export function useMySubmissions() {
  return useQuery({
    queryKey: ["submissions", "mine"],
    queryFn: async () => (await submissionsApi.mine()).map(mapSubmission),
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      conceptId: string;
      languageId: string;
      suggestedTranslation: string;
      pronunciation?: string;
      notes?: string;
    }) => submissionsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["submissions", "mine"] }),
  });
}
