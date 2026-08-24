"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Search, BookmarkPlus, BookMarked, Camera, MessageSquarePlus, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { cn } from "@/lib/utils/cn";
import { useActivity, useActivityStatistics } from "@/features/activity/hooks";

type RangeKey = "today" | "week" | "month" | "year" | "custom";

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
  { key: "custom", label: "Custom" },
];

function rangeToDates(range: RangeKey, customFrom?: string, customTo?: string) {
  const to = new Date();
  const from = new Date();
  switch (range) {
    case "today":
      from.setHours(0, 0, 0, 0);
      break;
    case "week":
      from.setDate(from.getDate() - 7);
      break;
    case "month":
      from.setMonth(from.getMonth() - 1);
      break;
    case "year":
      from.setFullYear(from.getFullYear() - 1);
      break;
    case "custom":
      return { from: customFrom, to: customTo };
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

export default function ActivityPage() {
  const [range, setRange] = useState<RangeKey>("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { from, to } = rangeToDates(range, customFrom, customTo);
  const params = range === "custom" && (!customFrom || !customTo) ? undefined : { from, to };

  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useActivityStatistics(params);
  const { data: activity, isLoading: activityLoading, isError: activityError, refetch: refetchActivity } = useActivity(params);

  const summaryTiles = useMemo(
    () => [
      { label: "Searches", value: stats?.searches, icon: Search },
      { label: "Saved words", value: stats?.savedWords, icon: BookmarkPlus },
      { label: "Books", value: stats?.books, icon: BookMarked },
      { label: "Scans", value: stats?.scans, icon: Camera },
      { label: "Contributions", value: stats?.contributions, icon: MessageSquarePlus },
    ],
    [stats],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">My Activity</h1>
        <p className="mt-1 text-muted-foreground">See how you&apos;ve been using Koro.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setRange(opt.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              range === opt.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {range === "custom" && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
          />
        </div>
      )}

      {statsError && <ErrorState onRetry={() => refetchStats()} />}

      {!statsError && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {statsLoading &&
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          {!statsLoading &&
            summaryTiles.map((tile) => (
              <Card key={tile.label}>
                <div className="flex flex-col gap-2 p-4">
                  <tile.icon className="size-4 text-primary" />
                  <p className="text-2xl font-bold">{tile.value ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{tile.label}</p>
                </div>
              </Card>
            ))}
        </div>
      )}

      {!statsError && !statsLoading && stats && stats.series.length > 0 && (
        <Card>
          <div className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Activity over time</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Activity log</h2>
        {activityError && <ErrorState onRetry={() => refetchActivity()} />}
        {activityLoading && !activityError && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        )}
        {!activityLoading && !activityError && (activity ?? []).length === 0 && (
          <EmptyState title="No activity in this range" description="Try a different time period." />
        )}
        {!activityLoading && !activityError && (activity ?? []).length > 0 && (
          <Card>
            <ul className="divide-y divide-border">
              {activity!.map((entry) => (
                <li key={entry.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <Clock className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1">{entry.description}</span>
                  <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
