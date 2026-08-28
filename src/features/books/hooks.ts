import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { collectionsApi } from "@/lib/api/endpoints";
import { mapBook, mapBookItem, toLanguageMap } from "@/lib/api/mappers";
import { fetchLanguages } from "@/features/languages/hooks";
import type { Book } from "@/types";

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

export function useUpdateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title, description }: { id: string; title: string; description?: string }) =>
      collectionsApi.update(id, title, description),
    // Optimistic: reflect the new title/description right away.
    onMutate: async ({ id, title, description }) => {
      await queryClient.cancelQueries({ queryKey: ["books", id] });
      const previous = queryClient.getQueryData<Book>(["books", id]);
      if (previous) {
        queryClient.setQueryData<Book>(["books", id], {
          ...previous,
          title,
          description: description ?? null,
        });
      }
      return { previous };
    },
    onError: (_err, { id }, context) => {
      if (context?.previous) queryClient.setQueryData(["books", id], context.previous);
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["books", variables.id] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionsApi.remove(id),
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
    // Patch the just-added row straight into the book cache from the server
    // response — no detail refetch, so the book behind the dialog updates the
    // instant the request resolves. Only the list (for its counts) is invalidated.
    onSuccess: async (raw, variables) => {
      const item = mapBookItem(raw, await withLanguageMap(queryClient));
      queryClient.setQueryData<Book>(["books", variables.collectionId], (prev) => {
        if (!prev) return prev;
        const items = [...prev.items.filter((i) => i.id !== item.id), item];
        return { ...prev, items, wordCount: items.length };
      });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export function useRemoveBookItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, itemId }: { collectionId: string; itemId: string }) =>
      collectionsApi.removeItem(collectionId, itemId),
    // Optimistic: drop the row immediately, roll back if the request fails.
    onMutate: async ({ collectionId, itemId }) => {
      await queryClient.cancelQueries({ queryKey: ["books", collectionId] });
      const previous = queryClient.getQueryData<Book>(["books", collectionId]);
      if (previous) {
        const items = previous.items.filter((i) => i.id !== itemId);
        queryClient.setQueryData<Book>(["books", collectionId], { ...previous, items, wordCount: items.length });
      }
      return { previous };
    },
    onError: (_err, { collectionId }, context) => {
      if (context?.previous) queryClient.setQueryData(["books", collectionId], context.previous);
    },
    // The detail cache is already correct from the optimistic update; only the
    // list needs refreshing for its word counts.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}
