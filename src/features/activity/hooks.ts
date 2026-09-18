import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/lib/api/endpoints";
import { mapActivityPage } from "@/lib/api/mappers";

export function useActivity(params?: { from?: string; to?: string; page?: number; size?: number }, enabled = true) {
  return useQuery({
    queryKey: ["activity", params],
    queryFn: async () => mapActivityPage(await activityApi.list(params)),
    enabled,
  });
}

// GET /activity/statistics has no date-range filter on the backend — the
// same lifetime totals are returned regardless of params.
export function useActivityStatistics() {
  return useQuery({
    queryKey: ["activity", "statistics"],
    queryFn: () => activityApi.statistics(),
  });
}
