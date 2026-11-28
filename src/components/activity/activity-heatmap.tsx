"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  Trophy,
  Zap,
  Calendar as CalendarIcon,
  CheckCircle2,
  TrendingUp,
  X,
  Languages,
  BookmarkPlus,
  Camera,
  FileDown,
  BookOpen,
  PlusCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/features/i18n/context";
import { ActivityEntry } from "@/types";
import {
  HeatmapDay,
  extractDayCounts,
  generateCalendarDays,
  getMonthLabels,
  computeStreakStats,
  toDhakaDateString,
  DHAKA_TIMEZONE,
} from "@/features/activity/chart-utils";
import { ContributionRecord, ContributionType } from "@/features/activity/contributions";

export interface ActivityHeatmapProps {
  contributions?: ContributionRecord[];
  dateContributions?: ContributionRecord[];
  isDateLoading?: boolean;
  entries?: ActivityEntry[];
  dayCounts?: Record<string, number>;
  totalActivities?: number;
  isLoading?: boolean;
  selectedDate?: string | null;
  onSelectDate?: (date: string | null) => void;
  className?: string;
}

// GitHub calendar standard dimensions
const CELL_SIZE = 10;
const CELL_GAP = 3;
const DISTANCE = CELL_SIZE + CELL_GAP; // 13px
const MARGIN_LEFT = 30;
const MARGIN_TOP = 20;
const TOTAL_WEEKS = 53;
const SVG_WIDTH = MARGIN_LEFT + TOTAL_WEEKS * DISTANCE + 6; // 725px
const SVG_HEIGHT = MARGIN_TOP + 7 * DISTANCE + 6; // 117px

// Authentic GitHub Contribution Colors
// Light: #ebedf0, #9be9a8, #40c463, #30a14e, #216e39
// Dark:  #161b22, #0e4429, #006d32, #26a641, #39d353
const GITHUB_LEVEL_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "fill-[#ebedf0] dark:fill-[#161b22] stroke-[rgba(27,31,35,0.06)] dark:stroke-[rgba(255,255,255,0.05)]",
  1: "fill-[#9be9a8] dark:fill-[#0e4429] stroke-transparent",
  2: "fill-[#40c463] dark:fill-[#006d32] stroke-transparent",
  3: "fill-[#30a14e] dark:fill-[#26a641] stroke-transparent",
  4: "fill-[#216e39] dark:fill-[#39d353] stroke-transparent",
};

const LEGEND_LEVEL_STYLES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-[#ebedf0] dark:bg-[#161b22] border-[rgba(27,31,35,0.06)] dark:border-[rgba(255,255,255,0.05)]",
  1: "bg-[#9be9a8] dark:bg-[#0e4429] border-transparent",
  2: "bg-[#40c463] dark:bg-[#006d32] border-transparent",
  3: "bg-[#30a14e] dark:bg-[#26a641] border-transparent",
  4: "bg-[#216e39] dark:bg-[#39d353] border-transparent",
};

function getContributionIcon(type: ContributionType | string) {
  switch (type) {
    case "DICTIONARY_SUBMISSION":
      return PlusCircle;
    case "TRANSLATION":
      return Languages;
    case "SAVE_WORD":
      return BookmarkPlus;
    case "IMAGE_RECOGNITION":
    case "IMAGE_UPLOAD":
      return Camera;
    case "EXPORT_PDF":
    case "DOWNLOAD_BOOK":
      return FileDown;
    case "ADD_VOCABULARY":
      return BookOpen;
    default:
      return Sparkles;
  }
}

function formatDhakaDate(dateStr: string, locale: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: DHAKA_TIMEZONE,
  });
}

function formatDhakaTime(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      timeZone: DHAKA_TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "";
  }
}

export function ActivityHeatmap({
  contributions = [],
  dateContributions,
  isDateLoading = false,
  entries = [],
  dayCounts: externalDayCounts,
  totalActivities,
  isLoading = false,
  selectedDate,
  onSelectDate,
  className,
}: ActivityHeatmapProps) {
  const { t, locale } = useI18n();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [selectedYear, setSelectedYear] = useState<"lastYear" | number>("lastYear");
  const [hoveredDay, setHoveredDay] = useState<{
    day: HeatmapDay;
    clientX: number;
    clientY: number;
  } | null>(null);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const availableYears = useMemo(() => {
    return [currentYear, currentYear - 1];
  }, [currentYear]);

  // Derive daily contribution counts in Asia/Dhaka
  const dayCounts = useMemo(() => {
    if (externalDayCounts) return externalDayCounts;
    if (contributions.length > 0) {
      const counts: Record<string, number> = {};
      for (const item of contributions) {
        const d = item.dhakaDate || toDhakaDateString(item.createdAt);
        if (d) counts[d] = (counts[d] ?? 0) + 1;
      }
      return counts;
    }
    return extractDayCounts(entries, DHAKA_TIMEZONE);
  }, [externalDayCounts, contributions, entries]);

  // Determine calendar date bounds
  const { endDate, weeksCount } = useMemo(() => {
    if (selectedYear === "lastYear") {
      return { endDate: new Date(), weeksCount: 52 };
    }
    const end = selectedYear === currentYear ? new Date() : new Date(selectedYear, 11, 31);
    return { endDate: end, weeksCount: 52 };
  }, [selectedYear, currentYear]);

  // Generate 53-week GitHub-style calendar grid
  const calendarDays = useMemo(() => {
    return generateCalendarDays(endDate, dayCounts, weeksCount);
  }, [endDate, dayCounts, weeksCount]);

  // Month labels with column alignment
  const monthLabels = useMemo(() => {
    return getMonthLabels(calendarDays, locale);
  }, [calendarDays, locale]);

  // Compute total, streak, and active days statistics
  const stats = useMemo(() => {
    return computeStreakStats(dayCounts, calendarDays);
  }, [dayCounts, calendarDays]);

  const displayTotal =
    totalActivities !== undefined && totalActivities !== null
      ? Math.max(totalActivities, stats.total)
      : stats.total;

  const displayActiveDays = stats.activeDays;
  const displayMaxStreak = stats.maxStreak;
  const displayCurrentStreak = stats.currentStreak;

  // Filter contributions on the clicked day
  const selectedDayContributions = useMemo(() => {
    if (!selectedDate) return [];
    if (dateContributions !== undefined) {
      return dateContributions;
    }
    if (contributions.length > 0) {
      return contributions.filter((c) => {
        const d = c.dhakaDate || toDhakaDateString(c.createdAt);
        return d === selectedDate;
      });
    }
    return entries
      .filter((entry) => toDhakaDateString(entry.createdAt) === selectedDate)
      .map((entry): ContributionRecord => ({
        id: entry.id,
        type: entry.type as ContributionType,
        title: entry.type.replace(/_/g, " "),
        description: entry.description,
        createdAt: entry.createdAt,
        dhakaDate: selectedDate,
      }));
  }, [dateContributions, contributions, entries, selectedDate]);

  // Auto-scroll to current week on mobile devices
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [selectedYear]);

  // GitHub standard weekday labels: Mon (row 1), Wed (row 3), Fri (row 5)
  const weekdayLabels = [
    { row: 1, label: locale === "bn" ? "সোম" : "Mon" },
    { row: 3, label: locale === "bn" ? "বুধ" : "Wed" },
    { row: 5, label: locale === "bn" ? "শুক্র" : "Fri" },
  ];

  const handleCellClick = (day: HeatmapDay) => {
    if (!onSelectDate) return;
    if (selectedDate === day.dateStr) {
      onSelectDate(null);
    } else {
      onSelectDate(day.dateStr);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* 4 Key Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: t("activity.totalContributions") || "Total Contributions",
            value: displayTotal,
            suffix: null,
            icon: TrendingUp,
            iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          },
          {
            label: t("activity.activeDays"),
            value: displayActiveDays,
            suffix: t("activity.days"),
            icon: CheckCircle2,
            iconClass: "bg-muted text-muted-foreground",
          },
          {
            label: t("activity.longestStreak"),
            value: displayMaxStreak,
            suffix: t("activity.days"),
            icon: Trophy,
            iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          },
          {
            label: t("activity.currentStreak"),
            value: displayCurrentStreak,
            suffix: t("activity.days"),
            icon: Zap,
            iconClass: "bg-primary/10 text-primary",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-border/80"
          >
            <div className={cn("flex size-9 items-center justify-center rounded-lg", card.iconClass)}>
              <card.icon className="size-4" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums sm:text-3xl text-foreground">
                {card.value}
                {card.suffix && (
                  <span className="ml-1 text-sm font-medium text-muted-foreground">{card.suffix}</span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* GitHub-style Contribution Card */}
      <div className="flex flex-col rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
        {/* Header: Total contributions in period & Year selector */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/50">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                {displayTotal}{" "}
                {displayTotal === 1
                  ? t("activity.contributionOn") || "contribution"
                  : t("activity.contributionsInYear") || "contributions in the last year"}
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("activity.heatmapSubtitle") || "Contribution activity tracked in Asia/Dhaka time (UTC+06:00)"}
            </p>
          </div>

          {/* Year selector pills */}
          <div className="flex items-center gap-1 self-start sm:self-auto rounded-lg bg-muted/60 p-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedYear("lastYear")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition-colors",
                selectedYear === "lastYear"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("activity.last12Months")}
            </button>
            {availableYears.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                className={cn(
                  "rounded-md px-2.5 py-1 font-medium transition-colors",
                  selectedYear === year
                    ? "bg-card text-foreground shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap Grid SVG */}
        <div className="relative pt-4">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin select-none"
          >
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className={cn(
                "w-full min-w-[725px] max-w-full overflow-visible font-sans transition-opacity duration-200",
                isLoading && "opacity-60 animate-pulse",
              )}
              style={{ maxHeight: 150 }}
            >
                {/* Month Labels */}
                {monthLabels.map((lbl, idx) => (
                  <text
                    key={`${lbl.name}-${idx}`}
                    x={MARGIN_LEFT + lbl.col * DISTANCE}
                    y={12}
                    className="fill-muted-foreground text-[10px] font-normal"
                  >
                    {lbl.name}
                  </text>
                ))}

                {/* Day of Week Labels (Mon, Wed, Fri) */}
                {weekdayLabels.map((item) => (
                  <text
                    key={item.label}
                    x={MARGIN_LEFT - 6}
                    y={MARGIN_TOP + item.row * DISTANCE + 8.5}
                    textAnchor="end"
                    className="fill-muted-foreground text-[9px] font-normal"
                  >
                    {item.label}
                  </text>
                ))}

                {/* Grid Cells */}
                <g>
                  {calendarDays.map((day) => {
                    const x = MARGIN_LEFT + day.col * DISTANCE;
                    const y = MARGIN_TOP + day.row * DISTANCE;
                    const isSelected = selectedDate === day.dateStr;

                    return (
                      <rect
                        key={day.dateStr}
                        x={x}
                        y={y}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        rx={2}
                        ry={2}
                        className={cn(
                          "cursor-pointer transition-all duration-100 stroke-[1px]",
                          GITHUB_LEVEL_CLASSES[day.level],
                          isSelected && "stroke-primary stroke-[2px] filter drop-shadow-xs",
                          "hover:stroke-foreground/80 hover:stroke-[1.5px]",
                        )}
                        onClick={() => handleCellClick(day)}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay({
                            day,
                            clientX: rect.left + rect.width / 2,
                            clientY: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    );
                  })}
                </g>
              </svg>
            </div>

          {/* GitHub-Authentic Tooltip */}
          {hoveredDay && (
            <div
              className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-full pb-2 animate-in fade-in zoom-in-95 duration-100"
              style={{ left: hoveredDay.clientX, top: hoveredDay.clientY }}
            >
              <div className="relative rounded-md bg-[#24292f] dark:bg-[#161b22] px-2.5 py-1.5 text-xs text-white shadow-lg border border-[#30363d] dark:border-[#444c56]">
                <p className="font-normal whitespace-nowrap">
                  <span className="font-semibold">
                    {hoveredDay.day.count === 0
                      ? t("activity.noContributionsOn") || "No contributions"
                      : `${hoveredDay.day.count} ${
                          hoveredDay.day.count === 1
                            ? t("activity.contributionOn") || "contribution"
                            : t("activity.contributionsOn") || "contributions"
                        }`}
                  </span>{" "}
                  on{" "}
                  {hoveredDay.day.date.toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: DHAKA_TIMEZONE,
                  })}
                </p>
                {/* Arrow pointer */}
                <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-4 border-transparent border-t-[#24292f] dark:border-t-[#161b22]" />
              </div>
            </div>
          )}
        </div>

        {/* Footer: Learn text & GitHub Less / More Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs border-t border-border/50">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3" />
            <span>Asia/Dhaka (UTC+06:00)</span>
          </div>

          {/* Authentic GitHub Legend */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>{t("activity.less")}</span>
            <div className="flex items-center gap-1">
              {([0, 1, 2, 3, 4] as const).map((lvl) => (
                <span
                  key={lvl}
                  className={cn(
                    "size-2.5 rounded-xs border",
                    LEGEND_LEVEL_STYLES[lvl],
                  )}
                />
              ))}
            </div>
            <span>{t("activity.more")}</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details Panel */}
      {selectedDate && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CalendarIcon className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {formatDhakaDate(selectedDate, locale)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isDateLoading
                    ? (locale === "bn" ? "লোড হচ্ছে…" : "Loading activities…")
                    : `${selectedDayContributions.length} ${
                        selectedDayContributions.length === 1
                          ? t("activity.contributionOn") || "contribution"
                          : t("activity.contributionsOn") || "contributions"
                      }`}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectDate?.(null)}
              className="size-8 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Contributions List */}
          {isDateLoading ? (
            <div className="flex flex-col gap-2.5 py-1">
              <div className="flex items-center gap-3.5 rounded-lg border border-border/60 bg-muted/20 p-3">
                <Skeleton className="size-8 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <div className="flex items-center gap-3.5 rounded-lg border border-border/60 bg-muted/20 p-3">
                <Skeleton className="size-8 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ) : selectedDayContributions.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {selectedDayContributions.map((item) => {
                const IconComponent = getContributionIcon(item.type);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm transition-colors hover:border-border hover:bg-muted/50"
                  >
                    <div className="flex size-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <IconComponent className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">
                          {item.title || item.description}
                        </p>
                        {item.status && (
                          <Badge
                            variant={item.status === "APPROVED" ? "success" : "outline"}
                            className="text-[10px] px-1.5 py-0 font-normal uppercase"
                          >
                            {item.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        {item.category && (
                          <span className="font-medium text-foreground/80">
                            {item.category}
                          </span>
                        )}
                        {item.createdAt && (
                          <span>{formatDhakaTime(item.createdAt)} (Dhaka)</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {t("activity.noContributionsOn") || "No contributions on"} {selectedDate}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
