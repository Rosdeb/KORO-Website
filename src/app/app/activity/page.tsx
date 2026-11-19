"use client";

import { useMemo, useState } from "react";
import { Activity, Languages, BookmarkPlus, Camera, FileDown } from "lucide-react";
import { useActivity, useActivityStatistics } from "@/features/activity/hooks";
import { useI18n } from "@/features/i18n/context";
import { ActivityHeatmap } from "@/components/activity/activity-heatmap";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { ActivityEntry } from "@/types";

export default function ActivityPage() {
  const { t } = useI18n();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: statsData } = useActivityStatistics();
  const { data: defaultActivity, isLoading: defaultLoading } = useActivity();
  const { data: pagedActivity, isLoading: pagedLoading } = useActivity({ page: 0, size: 50 });
  const { data: dayActivity } = useActivity(
    selectedDate ? { from: selectedDate, to: selectedDate, size: 50 } : undefined,
    Boolean(selectedDate),
  );

  const entries = useMemo(() => {
    const list: ActivityEntry[] = [];
    const seen = new Set<string>();
    for (const item of [
      ...(defaultActivity?.content ?? []),
      ...(pagedActivity?.content ?? []),
      ...(dayActivity?.content ?? []),
    ]) {
      if (item?.id && !seen.has(item.id)) {
        seen.add(item.id);
        list.push(item);
      }
    }
    return list;
  }, [defaultActivity, pagedActivity, dayActivity]);

  const isLoading = defaultLoading && pagedLoading && entries.length === 0;

  const breakdown = [
    {
      label: "Translations",
      value: statsData?.translations,
      icon: Languages,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Words saved",
      value: statsData?.savedWords,
      icon: BookmarkPlus,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
    {
      label: "Image scans",
      value: statsData?.imageRecognitions,
      icon: Camera,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
    {
      label: "PDF exports",
      value: statsData?.pdfExports,
      icon: FileDown,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-accent" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("activity.title")}
          </p>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">My Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("activity.subtitle")}</p>
      </div>

      {/* Heatmap (includes stat cards) */}
      <ActivityHeatmap
        entries={entries}
        totalActivities={statsData?.totalActivities}
        isLoading={isLoading}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Breakdown */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Breakdown</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Lifetime activity by type</p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
          {breakdown.map((s) => (
            <div key={s.label} className="flex flex-col gap-3 bg-card p-5">
              <div className={cn("flex size-9 items-center justify-center rounded-lg", s.bg)}>
                <s.icon className={cn("size-4", s.color)} />
              </div>
              {s.value === undefined ? (
                <Skeleton className="h-7 w-16 rounded" />
              ) : (
                <p className="text-2xl font-bold tabular-nums">{s.value}</p>
              )}
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
