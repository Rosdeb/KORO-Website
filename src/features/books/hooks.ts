import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { collectionsApi } from "@/lib/api/endpoints";
import { mapBook, toLanguageMap } from "@/lib/api/mappers";
import { fetchLanguages } from "@/features/languages/hooks";

async function withLanguageMap(qc: QueryClient) {
  const languages = await qc.ensureQueryData({ queryKey: ["languages"], queryFn: fetchLanguages, staleTime: 5 * 60 * 1000 });
  return toLanguageMap(languages);
}

export function useBooks() {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const [raw, languageMap] = await Promise.all([collectionsApi.list(), withLanguageMap(qc)]);
      return raw.map((c) => mapBook(c, languageMap));
    },
  });
}

export function useBook(id: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["books", id],
    queryFn: async () => {
      const [raw, languageMap] = await Promise.all([collectionsApi.getById(id), withLanguageMap(qc)]);
      return mapBook(raw, languageMap);
    },
    enabled: !!id,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, description }: { title: string; description?: string }) => {
      const raw = await collectionsApi.create(title, description);
      return mapBook(raw, await withLanguageMap(queryClient));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["books"] }),
  });
}

export function useAddBookItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      ...payload
    }: {
      collectionId: string;
      conceptId: string;
      languageId: string;
      chapter?: string;
      notes?: string;
    }) => collectionsApi.addItem(collectionId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["books", variables.collectionId] });
    },
  });
}

export function useRemoveBookItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, itemId }: { collectionId: string; itemId: string }) =>
      collectionsApi.removeItem(collectionId, itemId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books", variables.collectionId] });
    },
  });
}
