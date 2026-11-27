import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { activityApi, submissionsApi } from "@/lib/api/endpoints";
import { mapActivityPage, mapSubmissionPage } from "@/lib/api/mappers";
import { ActivityEntry, ActivityType, Submission } from "@/types";
import { toDhakaDateString } from "./chart-utils";

export type ContributionType =
  | "DICTIONARY_SUBMISSION"
  | "TRANSLATION"
  | "SAVE_WORD"
  | "IMAGE_RECOGNITION"
  | "IMAGE_UPLOAD"
  | "EXPORT_PDF"
  | "ADD_VOCABULARY"
  | "DOWNLOAD_BOOK";

export interface ContributionRecord {
  id: string;
  type: ContributionType;
  title: string;
  description: string;
  category?: string;
  status?: string;
  createdAt: string;
  dhakaDate: string; // YYYY-MM-DD in Asia/Dhaka
}

/**
 * Filter genuine contributions:
 * Exclude automated system events and non-creative logs (LOGIN, LOGOUT, UPDATE_PROFILE, CHANGE_LANGUAGE, SEARCH).
 */
const CONTRIBUTION_ACTIVITY_TYPES = new Set<ActivityType>([
  "TRANSLATION",
  "SAVE_WORD",
  "IMAGE_RECOGNITION",
  "IMAGE_UPLOAD",
  "EXPORT_PDF",
  "DOWNLOAD_BOOK",
  "ADD_VOCABULARY",
]);

function normalizeActivityToContribution(entry: ActivityEntry): ContributionRecord | null {
  if (!entry?.type || !CONTRIBUTION_ACTIVITY_TYPES.has(entry.type)) {
    return null;
  }

  const dhakaDate = toDhakaDateString(entry.createdAt);
  if (!dhakaDate) return null;

  let title = "Contribution";
  switch (entry.type) {
    case "TRANSLATION":
      title = "Word Translation";
      break;
    case "SAVE_WORD":
      title = "Saved Vocabulary Word";
      break;
    case "IMAGE_RECOGNITION":
      title = "Visual Dictionary Scan";
      break;
    case "IMAGE_UPLOAD":
      title = "Image Recognition Upload";
      break;
    case "EXPORT_PDF":
      title = "Exported Dictionary PDF";
      break;
    case "DOWNLOAD_BOOK":
      title = "Downloaded Vocabulary Book";
      break;
    case "ADD_VOCABULARY":
      title = "Added Vocabulary Entry";
      break;
  }

  return {
    id: `act-${entry.id}`,
    type: entry.type as ContributionType,
    title,
    description: entry.description,
    createdAt: entry.createdAt,
    dhakaDate,
  };
}

function normalizeSubmissionToContribution(submission: Submission): ContributionRecord | null {
  if (!submission?.id || !submission.createdAt) return null;

  const dhakaDate = toDhakaDateString(submission.createdAt);
  if (!dhakaDate) return null;

  const word = submission.sourceWord?.trim() || "Dictionary Word";
  const cat = submission.categoryName ? ` (${submission.categoryName})` : "";

  return {
    id: `sub-${submission.id}`,
    type: "DICTIONARY_SUBMISSION",
    title: `Dictionary Word: ${word}`,
    description: `Submitted Koch word "${word}"${cat} with translations`,
    category: submission.categoryName,
    status: submission.status,
    createdAt: submission.createdAt,
    dhakaDate,
  };
}

export function useContributions() {
  const activityQuery = useQuery({
    queryKey: ["activity", { size: 100 }],
    staleTime: 60 * 1000,
    queryFn: async ({ signal }) => mapActivityPage(await activityApi.list({ size: 100 }, signal)),
  });

  const submissionsQuery = useQuery({
    queryKey: ["submissions", "mine", 0, 100],
    staleTime: 60 * 1000,
    queryFn: async () => mapSubmissionPage(await submissionsApi.mine(0, 100)),
  });

  const { contributions, contributionsByDate, dayCounts } = useMemo(() => {
    const list: ContributionRecord[] = [];
    const seen = new Set<string>();

    // 1. Process dictionary submissions
    const submissions = submissionsQuery.data?.content ?? [];
    for (const sub of submissions) {
      const rec = normalizeSubmissionToContribution(sub);
      if (rec && !seen.has(rec.id)) {
        seen.add(rec.id);
        list.push(rec);
      }
    }

    // 2. Process genuine activity logs
    const activities = activityQuery.data?.content ?? [];
    for (const act of activities) {
      const rec = normalizeActivityToContribution(act);
      if (rec && !seen.has(rec.id)) {
        seen.add(rec.id);
        list.push(rec);
      }
    }

    // Sort by createdAt descending (most recent first)
    list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });

    // Group by Dhaka date (YYYY-MM-DD)
    const byDate: Record<string, ContributionRecord[]> = {};
    const counts: Record<string, number> = {};

    for (const item of list) {
      const d = item.dhakaDate;
      if (!byDate[d]) {
        byDate[d] = [];
      }
      byDate[d].push(item);
      counts[d] = (counts[d] ?? 0) + 1;
    }

    return {
      contributions: list,
      contributionsByDate: byDate,
      dayCounts: counts,
    };
  }, [activityQuery.data, submissionsQuery.data]);

  const isLoading = activityQuery.isLoading || submissionsQuery.isLoading;
  const isError = activityQuery.isError && submissionsQuery.isError;

  const refetch = () => {
    activityQuery.refetch();
    submissionsQuery.refetch();
  };

  return {
    contributions,
    contributionsByDate,
    dayCounts,
    totalContributions: contributions.length,
    isLoading,
    isError,
    refetch,
  };
}
