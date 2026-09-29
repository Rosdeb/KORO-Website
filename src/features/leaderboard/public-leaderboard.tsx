"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resolveApiFileUrl } from "@/lib/api/client";
import { canViewAdminLeaderboard, leaderboardApi, type LeaderboardEntry, type LeaderboardPeriod, type LeaderboardType } from "./api";

const filterClass = "h-11 min-w-0 gap-3 rounded-lg bg-background px-3 font-medium shadow-xs transition-colors hover:border-foreground/30";

function Contributor({ entry, current = false }: { entry: LeaderboardEntry; current?: boolean }) {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 md:flex-row md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span aria-label={`Rank ${entry.rank}`} className="w-7 shrink-0 text-center text-sm tabular-nums text-muted-foreground">{entry.rank}</span>
        <Avatar className="size-9 shrink-0">
          <AvatarImage src={resolveApiFileUrl(entry.profileImage)} alt="" />
          <AvatarFallback className="bg-muted text-xs text-foreground">{entry.name.split(/\s+/).map(part => part[0]).slice(0, 2).join("")}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="break-words text-sm font-semibold">{entry.name}{current && <span className="ml-2 text-xs font-normal text-muted-foreground">You</span>}</h3>
          {(entry.nativeLanguage || entry.badge) && <p className="mt-1 break-words text-xs text-muted-foreground">{[entry.nativeLanguage, entry.badge].filter(Boolean).join(" · ")}</p>}
        </div>
      </div>
      <dl className="grid min-w-0 grid-cols-3 gap-2 border-t border-border pt-3 text-center md:ml-auto md:w-72 md:shrink-0 md:border-0 md:pt-0">
        {([["Submissions", entry.submissionsCount], ["Translations", entry.translationsCount], ["Score", entry.score]] as const).map(([label, value]) => (
          <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-semibold tabular-nums">{value.toLocaleString()}</dd></div>
        ))}
      </dl>
    </div>
  );
}

function ContributorChart({ entries, type }: { entries: LeaderboardEntry[]; type: LeaderboardType }) {
  const valueOf = (entry: LeaderboardEntry) => type === "SUBMISSIONS" ? entry.submissionsCount : type === "TRANSLATIONS" ? entry.translationsCount : entry.score;
  const highestValue = Math.max(0, ...entries.map(valueOf));
  const maximum = Math.max(1, highestValue);
  const barColors = [
    "border-emerald-600 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-500",
    "border-blue-600 bg-blue-500 dark:border-blue-400 dark:bg-blue-500",
    "border-red-600 bg-red-500 dark:border-red-400 dark:bg-red-500",
  ];
  const label = type === "SUBMISSIONS" ? "Submissions" : type === "TRANSLATIONS" ? "Translations" : "Score";

  return (
    <div role="region" aria-label={`${label} by contributor, scroll horizontally to see more`} tabIndex={0} className="mb-6 overflow-x-auto overscroll-x-contain rounded-2xl border border-border bg-card px-4 pb-4 pt-5 focus-visible:outline-2 focus-visible:outline-ring sm:px-8 sm:pb-6">
      <ol className="flex min-w-full items-start justify-center gap-3 sm:gap-5">
        {entries.map((entry, index) => {
          const value = valueOf(entry);
          const leading = entry.rank === 1;
          return (
            <li key={entry.userId} className="min-w-20 max-w-32 flex-1 basis-20 text-center sm:min-w-24 sm:basis-24">
              <div className={`relative flex flex-col justify-end border-b border-border ${highestValue === 0 ? "h-28 sm:h-32" : "h-48 sm:h-56"}`}>
                <div className="mb-2 flex shrink-0 flex-col items-center gap-1.5">
                  <Avatar className={`size-10 border-2 border-card ring-1 sm:size-12 ${leading ? "ring-foreground" : "ring-border"}`}>
                    <AvatarImage src={resolveApiFileUrl(entry.profileImage)} alt="" />
                    <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">{entry.name.split(/\s+/).map(part => part[0]).slice(0, 2).join("")}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold tabular-nums">{value.toLocaleString()}<span className="sr-only"> {label}</span></span>
                </div>
                <div aria-hidden="true" className={`relative mx-auto w-14 shrink-0 overflow-hidden rounded-t-md border-x border-t sm:w-16 ${barColors[index % barColors.length]}`} style={{ height: `${Math.max(2, Math.max(0, value) / maximum * 58)}%`, minHeight: "4px" }}>
                  <div className="absolute inset-x-2 top-2 h-px bg-white/25" />
                  <div className="absolute inset-x-2 bottom-0 h-full border-x border-white/10" />
                </div>
              </div>
              <div className="pt-3">
                <span className={`inline-flex min-h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-semibold tabular-nums ${leading ? "bg-foreground text-background" : "text-muted-foreground"}`}><span className="sr-only">Rank </span>#{entry.rank}</span>
                <p className="mx-auto mt-2 max-w-28 break-words text-xs font-medium leading-5">{entry.name}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function PublicLeaderboard() {
  const { user, isLoading } = useAuth();
  const [type, setType] = useState<LeaderboardType>("OVERALL");
  const [period, setPeriod] = useState<LeaderboardPeriod>("ALL_TIME");
  const [limit, setLimit] = useState(20);
  const query = useQuery({
    queryKey: ["leaderboard", user?.id ?? "anonymous", type, period, limit],
    queryFn: ({ signal }) => leaderboardApi.list(type, period, limit, signal),
    enabled: !isLoading,
  });
  const data = query.isSuccess ? query.data : undefined;
  return (
    <div className="container-koro space-y-6 py-6 sm:py-10">
      <h1 className="sr-only">Contributor rankings</h1>
      <div role="group" aria-label="Ranking filters" className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:max-w-2xl sm:grid-cols-[1.3fr_1fr_0.8fr] sm:gap-4">
          <div className="col-span-2 min-w-0 space-y-2 sm:col-span-1">
            <label htmlFor="ranking-filter" className="block text-xs font-medium text-muted-foreground">Ranking</label>
            <Select value={type} onValueChange={value => setType(value as LeaderboardType)}>
              <SelectTrigger id="ranking-filter" className={filterClass}><SelectValue /></SelectTrigger>
              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="OVERALL" className="min-h-11">Overall</SelectItem>
                <SelectItem value="SUBMISSIONS" className="min-h-11">Submissions</SelectItem>
                <SelectItem value="TRANSLATIONS" className="min-h-11">Translations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 space-y-2">
            <label htmlFor="period-filter" className="block text-xs font-medium text-muted-foreground">Period</label>
            <Select value={period} onValueChange={value => setPeriod(value as LeaderboardPeriod)}>
              <SelectTrigger id="period-filter" className={filterClass}><SelectValue /></SelectTrigger>
              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="ALL_TIME" className="min-h-11">All time</SelectItem>
                <SelectItem value="MONTHLY" className="min-h-11">This month</SelectItem>
                <SelectItem value="WEEKLY" className="min-h-11">This week</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 space-y-2">
            <label htmlFor="limit-filter" className="block text-xs font-medium text-muted-foreground">Show</label>
            <Select value={String(limit)} onValueChange={value => setLimit(Number(value))}>
              <SelectTrigger id="limit-filter" className={filterClass}><SelectValue /></SelectTrigger>
              <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                {[20, 50, 100].map(count => <SelectItem key={count} value={String(count)} className="min-h-11">Top {count}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {canViewAdminLeaderboard(user?.roles) && <Button className="w-full rounded-lg sm:ml-auto sm:w-auto" asChild variant="outline"><Link href="/app/leaderboard">Contributor activity</Link></Button>}
      </div>
      {isLoading || query.isPending ? <p role="status">Loading rankings…</p> : query.isError ? (
        <div role="alert" className="space-y-3"><p>Unable to load rankings. {query.error.message}</p><Button onClick={() => query.refetch()}>Try again</Button></div>
      ) : data && <>
        <section aria-labelledby="rankings-heading">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <h2 id="rankings-heading" className="text-lg font-semibold">{period === "ALL_TIME" ? "All-time rankings" : period === "MONTHLY" ? "This month" : "This week"}</h2>
            <p className="text-sm text-muted-foreground">Ranked by {type === "OVERALL" ? "score" : type === "SUBMISSIONS" ? "approved submissions" : "translation activity"}</p>
          </div>
          {data.entries.length > 0 && <ContributorChart entries={data.entries} type={type} />}
          {data.entries.length === 0 ? <p className="rounded-xl border border-border p-6 text-sm text-muted-foreground">No contributions for this category and period yet.</p> : <ol className="divide-y divide-border rounded-xl border border-border bg-card">{data.entries.map(entry => <li key={entry.userId}><Contributor entry={entry} current={entry.userId === user?.id} /></li>)}</ol>}
        </section>
        {user && data.currentUserRank && <section aria-labelledby="your-rank" className="overflow-hidden rounded-2xl border border-border"><h2 id="your-rank" className="px-5 pt-4 font-bold">Your rank</h2><Contributor entry={data.currentUserRank} current /></section>}
        {user && !data.currentUserRank && <p className="text-sm text-muted-foreground">You don’t have a rank for this category and period yet.</p>}
      </>}
      {!isLoading && !user && <p className="text-sm text-muted-foreground"><Link className="underline" href="/login?returnTo=%2Fleaderboard">Sign in</Link> to see your own rank.</p>}
    </div>
  );
}
