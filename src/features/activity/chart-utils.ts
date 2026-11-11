// Utilities for GitHub-like activity heatmap calendar

export interface HeatmapDay {
  date: Date;
  dateStr: string; // yyyy-MM-dd
  col: number;     // 0 to 52
  row: number;     // 0 (Sun) to 6 (Sat)
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface MonthLabel {
  name: string;
  col: number;
}

export interface ActivityStreakStats {
  total: number;
  activeDays: number;
  maxStreak: number;
  currentStreak: number;
}

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Extracts activity counts per day from raw activity entries
 * Similar to extracting CL counts from changelog
 */
export function extractDayCounts(entries: { createdAt?: string | number }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    if (!entry?.createdAt) continue;
    let dateStr = "";
    if (typeof entry.createdAt === "string") {
      dateStr = entry.createdAt.split("T")[0];
      if (dateStr.includes(" ")) {
        dateStr = dateStr.split(" ")[0];
      }
    } else if (typeof entry.createdAt === "number") {
      const d = new Date(entry.createdAt);
      if (!Number.isNaN(d.getTime())) {
        dateStr = toLocalDateString(d);
      }
    }
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      counts[dateStr] = (counts[dateStr] ?? 0) + 1;
    }
  }
  return counts;
}

export function getColorLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (!count || count <= 0) return 0;
  if (maxCount <= 4) {
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
  }
  const q1 = Math.max(1, Math.ceil(maxCount * 0.25));
  const q2 = Math.max(2, Math.ceil(maxCount * 0.5));
  const q3 = Math.max(3, Math.ceil(maxCount * 0.75));
  if (count <= q1) return 1;
  if (count <= q2) return 2;
  if (count <= q3) return 3;
  return 4;
}

/**
 * Generates the 53-week calendar grid ending on endDate.
 * Weeks are columns (0 to 52), days are rows (0 for Sunday to 6 for Saturday).
 */
export function generateCalendarDays(
  endDate: Date,
  dayCounts: Record<string, number> = {},
  weeksCount = 52,
): HeatmapDay[] {
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const endDayOfWeek = end.getDay(); // 0 = Sun, 6 = Sat

  // Start date is Sunday 52 weeks before the current week
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (weeksCount * 7 + endDayOfWeek));

  const totalDays = weeksCount * 7 + endDayOfWeek + 1;
  const days: HeatmapDay[] = [];

  // Find max count to scale color intensity
  let maxCount = 0;
  for (let i = 0; i < totalDays; i++) {
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const dateStr = toLocalDateString(cur);
    const count = dayCounts[dateStr] ?? 0;
    if (count > maxCount) maxCount = count;
  }

  for (let i = 0; i < totalDays; i++) {
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const dateStr = toLocalDateString(cur);
    const count = dayCounts[dateStr] ?? 0;
    const col = Math.floor(i / 7);
    const row = cur.getDay();

    days.push({
      date: cur,
      dateStr,
      col,
      row,
      count,
      level: getColorLevel(count, maxCount),
    });
  }

  return days;
}

/**
 * Extract month labels positioned above week columns.
 */
export function getMonthLabels(
  days: HeatmapDay[],
  locale = "en",
): MonthLabel[] {
  const labels: MonthLabel[] = [];
  let lastMonth = -1;
  let lastCol = -10;

  for (const day of days) {
    const month = day.date.getMonth();
    // When the month changes and enough space (>= 2 cols) has elapsed
    if (month !== lastMonth && day.col - lastCol >= 2) {
      const monthName = day.date.toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", {
        month: "short",
      });
      labels.push({
        name: monthName,
        col: day.col,
      });
      lastMonth = month;
      lastCol = day.col;
    }
  }

  return labels;
}

/**
 * Calculate streak and active days statistics
 */
export function computeStreakStats(
  dayCounts: Record<string, number>,
  days: HeatmapDay[],
): ActivityStreakStats {
  let total = 0;
  let activeDays = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  for (const day of days) {
    const count = day.count;
    total += count;
    if (count > 0) {
      activeDays++;
      tempStreak++;
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current streak ending today or yesterday
  let currentStreak = 0;
  if (days.length > 0) {
    const lastDayIndex = days.length - 1;
    let idx = lastDayIndex;

    // If today has 0, check if yesterday was active to maintain the streak
    if (days[idx].count === 0 && idx > 0 && days[idx - 1].count > 0) {
      idx--;
    }

    while (idx >= 0 && days[idx].count > 0) {
      currentStreak++;
      idx--;
    }
  }

  return {
    total,
    activeDays,
    maxStreak,
    currentStreak,
  };
}
