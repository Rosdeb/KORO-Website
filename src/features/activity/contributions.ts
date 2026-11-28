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
  const summaryQuery = useQuery({
    queryKey: ["activity", "summary", "Asia/Dhaka"],
    staleTime: 60 * 1000,
    queryFn: ({ signal }) => activityApi.summary("Asia/Dhaka", signal),
    retry: 1,
  });

  // Fallback queries only if summary API fails (e.g. older backend returning 404)
  const isSummaryError = summaryQuery.isError;

  const activityQuery = useQuery({
    queryKey: ["activity", { size: 50 }],
    staleTime: 60 * 1000,
    enabled: isSummaryError,
    queryFn: async ({ signal }) => mapActivityPage(await activityApi.list({ size: 50 }, signal)),
  });

  const submissionsQuery = useQuery({
    queryKey: ["submissions", "mine", 0, 50],
    staleTime: 60 * 1000,
    enabled: isSummaryError,
    queryFn: async () => mapSubmissionPage(await submissionsApi.mine(0, 50)),
  });

  const { dayCounts, totalContributions, stats } = useMemo(() => {
    if (summaryQuery.data && !isSummaryError) {
      return {
        dayCounts: summaryQuery.data.dayCounts ?? {},
        totalContributions: summaryQuery.data.totalContributions ?? 0,
        stats: summaryQuery.data.stats,
      };
    }

    // Fallback derivation
    const list: ContributionRecord[] = [];
    const seen = new Set<string>();

    for (const sub of submissionsQuery.data?.content ?? []) {
      const rec = normalizeSubmissionToContribution(sub);
      if (rec && !seen.has(rec.id)) {
        seen.add(rec.id);
        list.push(rec);
      }
    }
    for (const act of activityQuery.data?.content ?? []) {
      const rec = normalizeActivityToContribution(act);
      if (rec && !seen.has(rec.id)) {
        seen.add(rec.id);
        list.push(rec);
      }
    }

    const counts: Record<string, number> = {};
    for (const item of list) {
      const d = item.dhakaDate;
      counts[d] = (counts[d] ?? 0) + 1;
    }

    return {
      dayCounts: counts,
      totalContributions: list.length,
      stats: undefined,
    };
  }, [summaryQuery.data, isSummaryError, submissionsQuery.data, activityQuery.data]);

  const isLoading = summaryQuery.isLoading || (isSummaryError && (activityQuery.isLoading || submissionsQuery.isLoading));

  const refetch = () => {
    summaryQuery.refetch();
    if (isSummaryError) {
      activityQuery.refetch();
      submissionsQuery.refetch();
    }
  };

  return {
    dayCounts,
    totalContributions,
    stats,
    isLoading,
    isError: isSummaryError && activityQuery.isError && submissionsQuery.isError,
    refetch,
    contributions: [] as ContributionRecord[],
  };
}

export function useDateContributions(selectedDate: string | null) {
  const query = useQuery({
    queryKey: ["activity", "date", selectedDate],
    enabled: !!selectedDate,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      if (!selectedDate) return [];
      const res = await activityApi.list({ from: selectedDate, to: selectedDate, size: 50 }, signal);
      const page = mapActivityPage(res);
      return page.content
        .map(normalizeActivityToContribution)
        .filter((c): c is ContributionRecord => c !== null);
    },
  });

  return {
    contributions: query.data ?? [],
    isLoading: query.isLoading && !query.data,
    isError: query.isError,
    refetch: query.refetch,
  };
}
