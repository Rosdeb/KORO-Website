import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/lib/api/endpoints";
import { mapActivityPage } from "@/lib/api/mappers";

export function useActivity(params?: { from?: string; to?: string; page?: number; size?: number }, enabled = true) {
  return useQuery({
    queryKey: ["activity", params],
    staleTime: 60 * 1000,
    queryFn: async ({ signal }) => mapActivityPage(await activityApi.list(params, signal)),
    enabled,
  });
}

// GET /activity/statistics has no date-range filter on the backend — the
// same lifetime totals are returned regardless of params.
export function useActivityStatistics() {
  return useQuery({
    queryKey: ["activity", "statistics"],
    staleTime: 60 * 1000,
    queryFn: () => activityApi.statistics(),
  });
}

export function useActivitySummary(timezone = "Asia/Dhaka") {
  return useQuery({
    queryKey: ["activity", "summary", timezone],
    staleTime: 60 * 1000,
    queryFn: ({ signal }) => activityApi.summary(timezone, signal),
  });
}
