import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { submissionsApi } from "@/lib/api/endpoints";
import { mapSubmissionPage } from "@/lib/api/mappers";

export function useMySubmissions(page = 0, size = 20) {
  return useQuery({
    queryKey: ["submissions", "mine", page, size],
    queryFn: async () => mapSubmissionPage(await submissionsApi.mine(page, size)),
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      categoryId: string;
      sourceLanguageId: string;
      sourceWord: string;
      banglaTranslation: string;
      englishTranslation: string;
      pronunciation?: string;
      exampleSentence?: string;
      note?: string;
    }) => submissionsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["submissions", "mine"] }),
  });
}
