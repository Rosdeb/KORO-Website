"use client";

import { useMemo, useState } from "react";
import { useActivity, useActivityStatistics } from "@/features/activity/hooks";
import { useI18n } from "@/features/i18n/context";
import { ActivityHeatmap } from "@/components/activity/activity-heatmap";
import { ActivityEntry } from "@/types";

export default function ActivityPage() {
  const { t } = useI18n();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 1. Fetch lifetime statistics from /activity/statistics
  const { data: statsData } = useActivityStatistics();

  // 2. Fetch default activity feed (no params, identical to dashboard)
  const { data: defaultActivity, isLoading: defaultLoading } = useActivity();

  // 3. Also fetch first page with safe size (50)
  const { data: pagedActivity, isLoading: pagedLoading } = useActivity({ page: 0, size: 50 });

  // 4. Fetch specific day's activities when a date is clicked
  const { data: dayActivity } = useActivity(
    selectedDate ? { from: selectedDate, to: selectedDate, size: 50 } : undefined,
    Boolean(selectedDate),
  );

  const entries = useMemo(() => {
    const list: ActivityEntry[] = [];
    const seen = new Set<string>();

    for (const item of defaultActivity?.content ?? []) {
      if (item?.id && !seen.has(item.id)) {
        seen.add(item.id);
        list.push(item);
      }
    }
    for (const item of pagedActivity?.content ?? []) {
      if (item?.id && !seen.has(item.id)) {
        seen.add(item.id);
        list.push(item);
      }
    }
    for (const item of dayActivity?.content ?? []) {
      if (item?.id && !seen.has(item.id)) {
        seen.add(item.id);
        list.push(item);
      }
    }
    return list;
  }, [defaultActivity, pagedActivity, dayActivity]);

  const isLoading = defaultLoading && pagedLoading && entries.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("activity.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("activity.subtitle")}
        </p>
      </div>

      <ActivityHeatmap
        entries={entries}
        totalActivities={statsData?.totalActivities}
        isLoading={isLoading}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </div>
  );
}
