import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/lib/api/endpoints";

export function useActivity(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["activity", params],
    queryFn: () => activityApi.list(params),
  });
}

export function useActivityStatistics(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["activity", "statistics", params],
    queryFn: () => activityApi.statistics(params),
  });
}
