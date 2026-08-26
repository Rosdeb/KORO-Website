import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/endpoints";
import { mapSubmission } from "@/lib/api/mappers";

export function useReviewQueue() {
  return useQuery({
    queryKey: ["review", "pending"],
    queryFn: async () => (await adminApi.submissions.pending()).map(mapSubmission),
  });
}

export function useApproveSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewerNote }: { id: string; reviewerNote?: string }) =>
      adminApi.submissions.approve(id, reviewerNote),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["review", "pending"] }),
  });
}

export function useRejectSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectionReason, reviewerNote }: { id: string; rejectionReason: string; reviewerNote?: string }) =>
      adminApi.submissions.reject(id, rejectionReason, reviewerNote),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["review", "pending"] }),
  });
}
