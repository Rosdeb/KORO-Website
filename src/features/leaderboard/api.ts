import { apiClient } from "@/lib/api/client";

export type LeaderboardType = "OVERALL" | "SUBMISSIONS" | "TRANSLATIONS";
export type LeaderboardPeriod = "ALL_TIME" | "MONTHLY" | "WEEKLY";
export type SubmissionStatus = "APPROVED" | "PENDING" | "REJECTED";
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  profileImage: string | null;
  nativeLanguage: string | null;
  submissionsCount: number;
  translationsCount: number;
  score: number;
  badge: string | null;
}
export interface LeaderboardResponse {
  type: LeaderboardType;
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  currentUserRank?: LeaderboardEntry | null;
}
export interface AdminContributor {
  rank: number;
  userId: string;
  name: string;
  email: string;
  profileImage: string | null;
  status: string;
  roles: string[];
  approvedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  totalSubmissions: number;
  translationActivities: number;
  score: number;
  createdAt: string;
}
export interface ContributorAudit {
  userId: string;
  name: string;
  email: string;
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  activityTypeBreakdown: Record<string, number>;
  calculatedScore: number;
}
export interface AdminFilters {
  status?: SubmissionStatus;
  from?: string;
  to?: string;
  limit: number;
}
export function canViewAdminLeaderboard(roles: string[] = []) {
  return roles.includes("ROLE_ADMIN") || roles.includes("ROLE_MODERATOR");
}
export const leaderboardApi = {
  list(type: LeaderboardType, period: LeaderboardPeriod, limit: number, signal?: AbortSignal) {
    const path = type === "OVERALL" ? "/leaderboard" : `/leaderboard/${type.toLowerCase()}`;
    const query = new URLSearchParams({ period, limit: String(Math.min(100, Math.max(1, limit))) });
    if (type === "OVERALL") query.set("type", type);
    return apiClient.get<LeaderboardResponse>(`${path}?${query}`, { auth: true, signal });
  },
  contributors(filters: AdminFilters, signal?: AbortSignal) {
    const query = new URLSearchParams({ limit: String(Math.min(500, Math.max(1, filters.limit))) });
    for (const key of ["status", "from", "to"] as const) {
      if (filters[key]) query.set(key, filters[key]);
    }
    return apiClient.get<AdminContributor[]>(`/admin/leaderboard?${query}`, { auth: true, signal });
  },
  audit(userId: string, signal?: AbortSignal) {
    return apiClient.get<ContributorAudit>(`/admin/leaderboard/users/${encodeURIComponent(userId)}`, { auth: true, signal });
  },
};
