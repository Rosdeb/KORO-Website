import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactApi, adminApi } from "@/lib/api/endpoints";
import type {
  SubmitContactPayload,
  SubmitContactResponse,
  ContactMessagePage,
  ContactMessageStatus,
} from "@/types";

export function useSubmitContact() {
  return useMutation<SubmitContactResponse, Error, SubmitContactPayload>({
    mutationFn: async (payload: SubmitContactPayload) => {
      const res = await contactApi.submit(payload);
      return res as SubmitContactResponse;
    },
  });
}

export interface AdminContactMessagesFilters {
  page?: number;
  size?: number;
  status?: ContactMessageStatus | "";
  search?: string;
}

export function useAdminContactMessages(filters: AdminContactMessagesFilters = {}) {
  const { page = 0, size = 20, status, search } = filters;

  return useQuery<ContactMessagePage>({
    queryKey: ["admin", "contact-messages", page, size, status, search],
    queryFn: async () => {
      const res = await adminApi.contactMessages.list({
        page,
        size,
        status: status || undefined,
        search: search ? search.trim() : undefined,
      });
      return res as ContactMessagePage;
    },
    staleTime: 30 * 1000,
  });
}
