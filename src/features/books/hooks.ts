import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collectionsApi } from "@/lib/api/endpoints";

export function useBooks() {
  return useQuery({
    queryKey: ["books"],
    queryFn: collectionsApi.list,
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ["books", id],
    queryFn: () => collectionsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, description }: { title: string; description?: string }) =>
      collectionsApi.create(title, description),
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
      languageCode: string;
      chapterId?: string;
      note?: string;
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
