import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api/endpoints";

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchApi.global(query),
    enabled: query.trim().length > 1,
    staleTime: 30 * 1000,
  });
}
