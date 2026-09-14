"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Award, BookOpenText, Languages, Medal, Trophy, Users, CheckCircle2 } from "lucide-react";
import { AnimatedStat } from "@/components/leaderboard/animated-stat";
import { useAuth } from "@/features/auth/context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveApiFileUrl } from "@/lib/api/client";
import { canViewAdminLeaderboard, leaderboardApi, type LeaderboardEntry, type LeaderboardPeriod, type LeaderboardType } from "./api";

export const filterClass = "mt-1 block h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm";

function RankMark({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="size-5 text-warning" aria-label="First place" />;
  if (rank === 2) return <Medal className="size-5 text-muted-foreground" aria-label="Second place" />;
  if (rank === 3) return <Award className="size-5 text-warning" aria-label="Third place" />;
  return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
}

function Contributor({ entry, current = false, featured = false }: { entry: LeaderboardEntry; current?: boolean; featured?: boolean }) {
  return (
    <div className={`relative flex flex-col gap-4 ${featured ? "md:flex-row md:items-center md:justify-between" : "px-3 py-4 transition-colors hover:bg-muted/50 sm:px-4 md:flex-row md:items-center"} ${current ? "bg-primary-50/50" : ""}`}>
      <div className="flex min-w-0 items-center gap-3">
        {!featured && <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted"><RankMark rank={entry.rank} /></div>}
        <div className="relative shrink-0">
          <Avatar className={featured ? "size-10" : "size-9"}>
            <AvatarImage src={resolveApiFileUrl(entry.profileImage)} alt={entry.name} />
            <AvatarFallback className={featured ? "bg-primary text-sm font-bold text-primary-foreground" : "text-xs"}>{entry.name.split(/\s+/).map(part => part[0]).slice(0, 2).join("")}</AvatarFallback>
          </Avatar>
          {featured && <div className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-white shadow ring-2 ring-background"><Trophy className="size-2.5" /></div>}
        </div>
        <div className="min-w-0 flex-1">
          {featured && <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">Featured Contributor · #{entry.rank}</span>}
          <h3 className={featured ? "mt-0.5 break-words text-base font-semibold" : "break-words text-sm font-semibold"}>{entry.name}{current && <span className="ml-2 text-xs text-muted-foreground">You</span>}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {entry.nativeLanguage && <Badge className="bg-muted/80 px-2.5 py-0.5 text-xs font-medium">{entry.nativeLanguage}</Badge>}
            {entry.badge && <Badge>{entry.badge}</Badge>}
          </div>
        </div>
      </div>
      <dl className="grid min-w-0 grid-cols-3 gap-1 rounded-xl bg-muted/50 px-1 py-2 text-center sm:gap-4 md:ml-auto md:bg-transparent md:p-0">
        {([["Submissions", entry.submissionsCount], ["Translations", entry.translationsCount], ["Score", entry.score]] as const).map(([label, value]) => (
          <div key={label} className="flex min-w-0 flex-col"><dt className="text-[10px] text-muted-foreground">{label}</dt><dd className="order-first [&>p]:text-base [&>p]:font-semibold"><AnimatedStat value={value} /></dd></div>
        ))}
      </dl>
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
  const featured = data?.entries[0];
  const impact = [
    { icon: Users, value: data?.entries.length ?? 0, label: "contributors listed" },
    { icon: CheckCircle2, value: data?.entries.reduce((sum, entry) => sum + entry.submissionsCount, 0) ?? 0, label: "approved submissions" },
    { icon: Languages, value: new Set(data?.entries.map(entry => entry.nativeLanguage).filter(Boolean)).size, label: "languages represented" },
  ];
  return (
    <div>
      <section className="border-b border-border bg-primary-50/60">
        <div className="container-koro py-10 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-sm"><Trophy className="size-3.5" /> Community leaderboard</div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-4xl">The people behind the words</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">A public portfolio of the community members who help document, translate, and preserve language knowledge on Koro.</p>
          </div>
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:mt-10">
            {impact.map(({ icon: Icon, value, label }) => <div key={label} className="flex min-w-0 flex-col items-center justify-center gap-1 px-1.5 py-4 text-center sm:px-5 sm:py-5"><Icon className="size-4 shrink-0 text-primary sm:size-5" /><div className="min-w-0">{data ? <AnimatedStat value={value} /> : <p className="text-xl font-extrabold" aria-label="Not available">—</p>}<p className="text-[10px] leading-tight text-muted-foreground sm:text-xs">{label}</p></div></div>)}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">Totals for the contributors shown in the selected ranking and period.</p>
        </div>
      </section>
      <main className="container-koro space-y-8 py-8 sm:py-16">
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end sm:gap-4">
          <label className="min-w-0 text-sm font-medium sm:min-w-36">Ranking<select className={filterClass} value={type} onChange={e => setType(e.target.value as LeaderboardType)}><option value="OVERALL">Overall</option><option value="SUBMISSIONS">Submissions</option><option value="TRANSLATIONS">Translations</option></select></label>
          <label className="min-w-0 text-sm font-medium sm:min-w-36">Period<select className={filterClass} value={period} onChange={e => setPeriod(e.target.value as LeaderboardPeriod)}><option value="ALL_TIME">All time</option><option value="MONTHLY">Monthly</option><option value="WEEKLY">Weekly</option></select></label>
          <label className="min-w-0 text-sm font-medium sm:min-w-28">Show<select className={filterClass} value={limit} onChange={e => setLimit(Number(e.target.value))}>{[20, 50, 100].map(n => <option key={n} value={n}>Top {n}</option>)}</select></label>
          {canViewAdminLeaderboard(user?.roles) && <Button className="col-span-2 self-end sm:w-auto" asChild variant="outline"><Link href="/app/leaderboard">Contributor administration</Link></Button>}
        </div>
        {isLoading || query.isPending ? <p role="status">Loading rankings…</p> : query.isError ? (
          <div role="alert" className="space-y-3"><p>Unable to load rankings. {query.error.message}</p><Button onClick={() => query.refetch()}>Try again</Button></div>
        ) : data && <>
          {featured && <section aria-label="Featured contributor" className="overflow-hidden rounded-xl border border-border bg-card p-4">
            <Contributor entry={featured} featured current={featured.userId === user?.id} />
          </section>}
          {user && data.currentUserRank && <section aria-labelledby="your-rank" className="overflow-hidden rounded-2xl border border-border"><h2 id="your-rank" className="px-5 pt-4 font-bold">Your rank</h2><Contributor entry={data.currentUserRank} current /></section>}
          {user && !data.currentUserRank && <p className="text-sm text-muted-foreground">You don’t have a rank for this category and period yet.</p>}
          <section aria-labelledby="rankings-heading">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Contributor portfolios</p><h2 id="rankings-heading" className="mt-1 text-2xl font-bold">{period === "ALL_TIME" ? "Top contributors of all time" : period === "MONTHLY" ? "Top contributors this month" : "Top contributors this week"}</h2></div><p className="text-sm text-muted-foreground">Ranked by {type === "OVERALL" ? "overall score" : type === "SUBMISSIONS" ? "approved submissions" : "translation activity"}.</p></div>
            {data.entries.length === 0 ? <p className="rounded-2xl border border-border p-8 text-center text-muted-foreground">No contributions to rank for this category and period yet.</p> : data.entries.length === 1 ? <p className="text-sm text-muted-foreground">Our leading contributor is featured above. More contributors will appear here as the community grows.</p> : <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">{data.entries.slice(1).map(entry => <li key={entry.userId}><Contributor entry={entry} current={entry.userId === user?.id} /></li>)}</ol>}
          </section>
        </>}
        {!isLoading && !user && <p className="text-sm text-muted-foreground"><Link className="underline" href="/login?returnTo=%2Fleaderboard">Sign in</Link> to see your own rank.</p>}
        <section className="rounded-3xl border border-border bg-muted/50 p-7 text-center sm:p-10">
          <BookOpenText className="mx-auto size-6 text-primary" />
          <h2 className="mt-3 text-xl font-bold">Every contribution has a story</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Leaderboard profiles celebrate published work while keeping the focus on the languages, communities, and knowledge each contributor helps preserve.</p>
        </section>
      </main>
    </div>
  );
}
