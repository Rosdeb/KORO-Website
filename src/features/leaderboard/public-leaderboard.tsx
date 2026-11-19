"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, ArrowRight } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resolveApiFileUrl } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import {
  canViewAdminLeaderboard,
  leaderboardApi,
  type LeaderboardEntry,
  type LeaderboardPeriod,
  type LeaderboardType,
} from "./api";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function statValue(entry: LeaderboardEntry, type: LeaderboardType) {
  if (type === "SUBMISSIONS") return entry.submissionsCount;
  if (type === "TRANSLATIONS") return entry.translationsCount;
  return entry.score;
}

const MEDAL: Record<number, { bg: string; text: string; ring: string; bar: string }> = {
  1: {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-400/70",
    bar: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20",
  },
  2: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-400/70",
    bar: "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20",
  },
  3: {
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-400/70",
    bar: "border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20",
  },
};

function RankBadge({ rank, isCurrent }: { rank: number; isCurrent?: boolean }) {
  const m = MEDAL[rank];
  if (m) {
    return (
      <span
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-full text-xs font-bold",
          m.bg,
          m.text,
        )}
      >
        {rank}
      </span>
    );
  }
  if (isCurrent) {
    return (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
        {rank}
      </span>
    );
  }
  return (
    <span className="inline-flex size-7 items-center justify-center text-sm tabular-nums text-muted-foreground">
      {rank}
    </span>
  );
}

function PodiumCard({
  entry,
  type,
  isCurrent,
}: {
  entry: LeaderboardEntry;
  type: LeaderboardType;
  isCurrent: boolean;
}) {
  const m = MEDAL[entry.rank];
  const val = statValue(entry, type).toLocaleString();
  const topPad: Record<number, string> = { 1: "pt-6", 2: "pt-14", 3: "pt-20" };
  const avatarSize: Record<number, string> = { 1: "size-20", 2: "size-16", 3: "size-14" };
  const barH: Record<number, string> = { 1: "h-20", 2: "h-14", 3: "h-9" };
  return (
    <div className={cn("flex flex-1 flex-col items-center text-center", topPad[entry.rank])}>
      <div className="relative">
        <Avatar className={cn(avatarSize[entry.rank], "ring-2", m?.ring ?? "ring-border")}>
          <AvatarImage src={resolveApiFileUrl(entry.profileImage)} alt="" />
          <AvatarFallback className={cn("text-xs font-semibold", m?.bg, m?.text)}>
            {initials(entry.name)}
          </AvatarFallback>
        </Avatar>
        <span className={cn("absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold", m?.bg, m?.text)}>
          {entry.rank}
        </span>
      </div>
      <p className="mt-2 max-w-[72px] truncate text-xs font-semibold">
        {entry.name}
        {isCurrent && <span className="text-accent"> ·you</span>}
      </p>
      <p className={cn("mt-0.5 text-sm font-bold tabular-nums", m?.text)}>{val}</p>
      <div className={cn("mt-2 w-full rounded-t border-x border-t", barH[entry.rank], m?.bar ?? "border-border bg-muted/20")} />
    </div>
  );
}

function Podium({
  entries,
  type,
  currentUserId,
}: {
  entries: LeaderboardEntry[];
  type: LeaderboardType;
  currentUserId?: string;
}) {
  const top = entries.slice(0, 3);
  if (top.length < 1) return null;

  const ordered =
    top.length === 3
      ? [top[1], top[0], top[2]]
      : top.length === 2
      ? [top[1], top[0]]
      : [top[0]];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card px-8 pb-0 pt-12">
      <div className="flex items-end justify-center gap-6">
        {ordered.map((e) => (
          <PodiumCard
            key={e.userId}
            entry={e}
            type={type}
            isCurrent={e.userId === currentUserId}
          />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, active }: { label: string; value: number; active: boolean }) {
  return (
    <div className="min-w-[3.5rem]">
      <p className={cn("text-xs text-muted-foreground", active && "text-accent")}>{label}</p>
      <p className={cn("text-sm font-semibold tabular-nums", active && "text-accent")}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function ContributorRow({
  entry,
  type,
  isCurrent,
}: {
  entry: LeaderboardEntry;
  type: LeaderboardType;
  isCurrent: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 sm:px-5",
        isCurrent && "bg-accent/5 ring-inset ring-1 ring-accent/20",
      )}
    >
      <RankBadge rank={entry.rank} isCurrent={isCurrent} />
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={resolveApiFileUrl(entry.profileImage)} alt="" />
        <AvatarFallback className="text-xs">{initials(entry.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {entry.name}
          {isCurrent && <span className="ml-1.5 text-xs text-accent">you</span>}
        </p>
        {entry.nativeLanguage && (
          <p className="truncate text-xs text-muted-foreground">{entry.nativeLanguage}</p>
        )}
      </div>
      <div className="hidden shrink-0 items-center gap-5 text-right sm:flex">
        <Stat label="Submissions" value={entry.submissionsCount} active={type === "SUBMISSIONS"} />
        <Stat label="Translations" value={entry.translationsCount} active={type === "TRANSLATIONS"} />
        <Stat label="Score" value={entry.score} active={type === "OVERALL"} />
      </div>
      <div className="shrink-0 text-right sm:hidden">
        <p className="text-sm font-semibold tabular-nums">{statValue(entry, type).toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">
          {type === "SUBMISSIONS" ? "submissions" : type === "TRANSLATIONS" ? "translations" : "score"}
        </p>
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="rounded-xl border border-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-0">
            <Skeleton className="size-7 rounded-full" />
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

const TYPE_OPTIONS: { value: LeaderboardType; label: string }[] = [
  { value: "OVERALL", label: "Overall" },
  { value: "SUBMISSIONS", label: "Submissions" },
  { value: "TRANSLATIONS", label: "Translations" },
];

export function PublicLeaderboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [type, setType] = useState<LeaderboardType>("OVERALL");
  const [period, setPeriod] = useState<LeaderboardPeriod>("ALL_TIME");
  const [limit, setLimit] = useState(20);

  const query = useQuery({
    queryKey: ["leaderboard", user?.id ?? "anonymous", type, period, limit],
    queryFn: ({ signal }) => leaderboardApi.list(type, period, limit, signal),
    enabled: !authLoading,
  });

  const data = query.isSuccess ? query.data : undefined;
  const topEntries = data?.entries.slice(0, 3) ?? [];
  const restEntries = data?.entries.slice(3) ?? [];

  const periodLabel =
    period === "ALL_TIME" ? "All time" : period === "MONTHLY" ? "This month" : "This week";
  const typeLabel =
    type === "OVERALL" ? "score" : type === "SUBMISSIONS" ? "approved submissions" : "translations";

  return (
    <div className="container-koro py-10 sm:py-14">

      {/* header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-accent" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Leaderboard
            </p>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Top Contributors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked by {typeLabel} · {periodLabel}
          </p>
        </div>
        {canViewAdminLeaderboard(user?.roles) && (
          <Button variant="outline" size="sm" asChild className="w-fit shrink-0">
            <Link href="/app/leaderboard">
              Contributor activity <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>

      {/* filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-md border border-border bg-muted/40 p-1">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={cn(
                "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                type === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)}>
            <SelectTrigger className="h-9 w-36 rounded-md text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_TIME">All time</SelectItem>
              <SelectItem value="MONTHLY">This month</SelectItem>
              <SelectItem value="WEEKLY">This week</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
            <SelectTrigger className="h-9 w-24 rounded-md text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[20, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  Top {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* content */}
      {authLoading || query.isPending ? (
        <LeaderboardSkeleton />
      ) : query.isError ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">Could not load rankings.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => query.refetch()}>
            Try again
          </Button>
        </div>
      ) : data && data.entries.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <Medal className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No contributions for this period yet.</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {topEntries.length > 0 && (
            <Podium entries={topEntries} type={type} currentUserId={user?.id} />
          )}
          {restEntries.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {restEntries.map((entry, i) => (
                <div key={entry.userId} className={i > 0 ? "border-t border-border" : ""}>
                  <ContributorRow entry={entry} type={type} isCurrent={entry.userId === user?.id} />
                </div>
              ))}
            </div>
          )}
          {user && data.currentUserRank && (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center gap-4 px-5 py-4">
                <Avatar className="size-12 shrink-0">
                  <AvatarImage src={resolveApiFileUrl(data.currentUserRank.profileImage)} alt="" />
                  <AvatarFallback className="text-sm font-semibold">{initials(data.currentUserRank.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{data.currentUserRank.name}</p>
                  {data.currentUserRank.nativeLanguage && (
                    <p className="truncate text-xs text-muted-foreground">{data.currentUserRank.nativeLanguage}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold tabular-nums leading-none">#{data.currentUserRank.rank}</p>
                  <p className="mt-1 text-xs text-muted-foreground">your rank</p>
                </div>
              </div>
              <div className="flex divide-x divide-border border-t border-border">
                <div className={cn("flex-1 px-4 py-3 text-center", type === "SUBMISSIONS" && "bg-accent/5")}>
                  <p className={cn("text-sm font-semibold tabular-nums", type === "SUBMISSIONS" ? "text-accent" : "text-foreground")}>
                    {data.currentUserRank.submissionsCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Submissions</p>
                </div>
                <div className={cn("flex-1 px-4 py-3 text-center", type === "TRANSLATIONS" && "bg-accent/5")}>
                  <p className={cn("text-sm font-semibold tabular-nums", type === "TRANSLATIONS" ? "text-accent" : "text-foreground")}>
                    {data.currentUserRank.translationsCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Translations</p>
                </div>
                <div className={cn("flex-1 px-4 py-3 text-center", type === "OVERALL" && "bg-accent/5")}>
                  <p className={cn("text-sm font-semibold tabular-nums", type === "OVERALL" ? "text-accent" : "text-foreground")}>
                    {data.currentUserRank.score.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
            </div>
          )}
          {user && !data.currentUserRank && (
            <p className="text-sm text-muted-foreground">
              You don&apos;t have a rank for this category and period yet.
            </p>
          )}
        </div>
      ) : null}

      {!authLoading && !user && (
        <p className="mt-4 text-sm text-muted-foreground">
          <Link
            href="/login?returnTo=%2Fleaderboard"
            className="font-medium text-accent hover:underline"
          >
            Sign in
          </Link>{" "}
          to see your own rank.
        </p>
      )}
    </div>
  );
}
