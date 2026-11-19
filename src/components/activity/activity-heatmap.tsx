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
  Search,
  BookOpen,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/features/i18n/context";
import { ActivityEntry, ActivityType } from "@/types";
import { Glass } from "@/components/ui/glass";
import {
  HeatmapDay,
  extractDayCounts,
  generateCalendarDays,
  getMonthLabels,
  computeStreakStats,
  toLocalDateString,
} from "@/features/activity/chart-utils";

export interface ActivityHeatmapProps {
  entries?: ActivityEntry[];
  totalActivities?: number;
  isLoading?: boolean;
  selectedDate?: string | null;
  onSelectDate?: (date: string | null) => void;
  className?: string;
}

const BOX_SIZE = 11;
const BOX_GAP = 3;
const DISTANCE = BOX_SIZE + BOX_GAP; // 14
const MARGIN_LEFT = 32;
const MARGIN_TOP = 20;
const TOTAL_WEEKS = 53;
const SVG_WIDTH = MARGIN_LEFT + TOTAL_WEEKS * DISTANCE + 8; // 782
const SVG_HEIGHT = MARGIN_TOP + 7 * DISTANCE + 8; // 126

const LEVEL_FILL_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "fill-zinc-100 dark:fill-zinc-900/60 stroke-zinc-200/60 dark:stroke-zinc-800/60",
  1: "fill-emerald-200 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-800",
  2: "fill-emerald-400 dark:fill-emerald-700 stroke-emerald-500 dark:stroke-emerald-600",
  3: "fill-emerald-500 dark:fill-emerald-500 stroke-emerald-600 dark:stroke-emerald-400",
  4: "fill-emerald-700 dark:fill-emerald-300 stroke-emerald-800 dark:stroke-emerald-200",
};

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "TRANSLATION":
      return Languages;
    case "SAVE_WORD":
    case "REMOVE_SAVED_WORD":
      return BookmarkPlus;
    case "IMAGE_RECOGNITION":
    case "IMAGE_UPLOAD":
      return Camera;
    case "EXPORT_PDF":
    case "DOWNLOAD_BOOK":
      return FileDown;
    case "SEARCH":
      return Search;
    case "ADD_VOCABULARY":
      return BookOpen;
    default:
      return Clock;
  }
}

function formatSelectedDate(dateStr: string, locale: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatActivityTime(createdAt: string): string {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatActivityType(type: string): string {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ActivityHeatmap({
  entries = [],
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

  // Aggregate daily counts from entries
  const dayCounts = useMemo(() => extractDayCounts(entries), [entries]);

  // Determine date bounds
  const { endDate, weeksCount } = useMemo(() => {
    if (selectedYear === "lastYear") {
      return { endDate: new Date(), weeksCount: 52 };
    }
    const end = selectedYear === currentYear ? new Date() : new Date(selectedYear, 11, 31);
    return { endDate: end, weeksCount: 52 };
  }, [selectedYear, currentYear]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    return generateCalendarDays(endDate, dayCounts, weeksCount);
  }, [endDate, dayCounts, weeksCount]);

  // Month labels
  const monthLabels = useMemo(() => {
    return getMonthLabels(calendarDays, locale);
  }, [calendarDays, locale]);

  // Stats (total, streaks, active days)
  const stats = useMemo(() => {
    return computeStreakStats(dayCounts, calendarDays);
  }, [dayCounts, calendarDays]);

  const displayTotal =
    totalActivities !== undefined && totalActivities !== null
      ? Math.max(totalActivities, stats.total)
      : stats.total;

  const displayActiveDays = Math.max(stats.activeDays, displayTotal > 0 ? 1 : 0);
  const displayMaxStreak = Math.max(stats.maxStreak, displayTotal > 0 ? 1 : 0);
  const displayCurrentStreak = Math.max(stats.currentStreak, displayTotal > 0 ? 1 : 0);

  // Activities filtered for the clicked date
  const selectedDayActivities = useMemo(() => {
    if (!selectedDate) return [];
    return entries.filter((entry) => {
      if (!entry?.createdAt) return false;
      const dStr =
        typeof entry.createdAt === "string"
          ? entry.createdAt.split("T")[0].split(" ")[0]
          : toLocalDateString(new Date(entry.createdAt));
      return dStr === selectedDate;
    });
  }, [entries, selectedDate]);

  // Scroll to recent activity on mobile
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [selectedYear]);

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
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: t("activity.totalActivities"),
            value: displayTotal,
            suffix: null,
            icon: TrendingUp,
            iconClass: "bg-accent/10 text-accent",
          },
          {
            label: t("activity.activeDays"),
            value: displayActiveDays,
            suffix: null,
            icon: CheckCircle2,
            iconClass: "bg-muted text-muted-foreground",
          },
          {
            label: t("activity.longestStreak"),
            value: displayMaxStreak,
            suffix: t("activity.days"),
            icon: Trophy,
            iconClass: "bg-muted text-muted-foreground",
          },
          {
            label: t("activity.currentStreak"),
            value: displayCurrentStreak,
            suffix: t("activity.days"),
            icon: Zap,
            iconClass: "bg-muted text-muted-foreground",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className={cn("flex size-9 items-center justify-center rounded-lg", card.iconClass)}>
              <card.icon className="size-4" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums sm:text-3xl">
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

      {/* Chart Section Header with Title and Year Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-primary" />
            <h2 className="text-base font-semibold tracking-tight">
              {t("activity.heatmapTitle")}
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("activity.heatmapSubtitle")}
          </p>
        </div>

        {/* Year Selector Pills */}
        <div className="flex items-center gap-1 self-start sm:self-auto rounded-xl bg-muted p-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedYear("lastYear")}
            className={cn(
              "rounded-lg px-2.5 py-1 font-medium transition-colors",
              selectedYear === "lastYear"
                ? "bg-card text-foreground shadow-xs"
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
                "rounded-lg px-2.5 py-1 font-medium transition-colors",
                selectedYear === year
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Heatmap Calendar Container */}
      <div className="relative">
        {isLoading ? (
          <Skeleton className="h-[130px] w-full rounded-2xl" />
        ) : (
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin select-none"
          >
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="w-full min-w-[720px] max-w-full overflow-visible font-sans"
              style={{ maxHeight: 160 }}
            >
              {/* Month Labels */}
              {monthLabels.map((lbl, idx) => (
                <text
                  key={`${lbl.name}-${idx}`}
                  x={MARGIN_LEFT + lbl.col * DISTANCE}
                  y={12}
                  className="fill-muted-foreground text-[10px] font-medium"
                >
                  {lbl.name}
                </text>
              ))}

              {/* Day of Week Labels */}
              {weekdayLabels.map((item) => (
                <text
                  key={item.label}
                  x={MARGIN_LEFT - 6}
                  y={MARGIN_TOP + item.row * DISTANCE + 8.5}
                  textAnchor="end"
                  className="fill-muted-foreground/75 text-[9px] font-normal"
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
                      width={BOX_SIZE}
                      height={BOX_SIZE}
                      rx={2.5}
                      ry={2.5}
                      className={cn(
                        "cursor-pointer transition-all duration-150 stroke-[1px]",
                        LEVEL_FILL_CLASSES[day.level],
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
                    >
                      <title>
                        {day.count === 0
                          ? `${t("activity.noActivityOn")} ${day.dateStr}`
                          : `${day.count} ${day.count === 1 ? t("activity.activityOn") : t("activity.activitiesOn")} ${day.dateStr}`}
                      </title>
                    </rect>
                  );
                })}
              </g>
            </svg>
          </div>
        )}

        {/* Floating Custom Tooltip */}
        {hoveredDay && (
          <div
            className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-full pb-2 animate-in fade-in zoom-in-95 duration-100"
            style={{ left: hoveredDay.clientX, top: hoveredDay.clientY }}
          >
            <div className="rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-md backdrop-blur-sm">
              <p className="font-semibold text-foreground">
                {hoveredDay.day.count > 0 ? (
                  <>
                    <span className="text-primary font-bold">{hoveredDay.day.count}</span>{" "}
                    {hoveredDay.day.count === 1
                      ? t("activity.activityOn")
                      : t("activity.activitiesOn")}
                  </>
                ) : (
                  t("activity.noActivityOn")
                )}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {hoveredDay.day.date.toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="text-[10px] text-primary/80 mt-1 flex items-center gap-1">
                {t("activity.clickToFilter")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Legend & Total summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
        <span className="text-muted-foreground">
          {displayTotal} {t("activity.activitiesInYear")}
        </span>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span>{t("activity.less")}</span>
          <div className="flex items-center gap-1">
            {([0, 1, 2, 3, 4] as const).map((lvl) => (
              <span
                key={lvl}
                className={cn(
                  "size-2.5 rounded-xs border border-border/40",
                  lvl === 0 && "bg-zinc-100 dark:bg-zinc-800",
                  lvl === 1 && "bg-emerald-200 dark:bg-emerald-950",
                  lvl === 2 && "bg-emerald-400 dark:bg-emerald-700",
                  lvl === 3 && "bg-emerald-500 dark:bg-emerald-500",
                  lvl === 4 && "bg-emerald-700 dark:bg-emerald-300",
                )}
              />
            ))}
          </div>
          <span>{t("activity.more")}</span>
        </div>
      </div>

      {/* Day Details Glass Card — appears when a day is clicked */}
      {selectedDate && (
        <Glass
          radius={16}
          strength={0.5}
          blur={4}
          tint={0.25}
          dome={0.08}
          className="border border-border/60 bg-card/50 shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-200"
          contentClassName="p-5 flex flex-col gap-4"
        >
          {/* Details Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarIcon className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {formatSelectedDate(selectedDate, locale)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedDayActivities.length}{" "}
                  {selectedDayActivities.length === 1
                    ? t("activity.activityOn")
                    : t("activity.activitiesOn")}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectDate?.(null)}
              className="size-8 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Activities List */}
          {selectedDayActivities.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {selectedDayActivities.map((entry) => {
                const IconComponent = getActivityIcon(entry.type);
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3.5 rounded-xl border border-border/40 bg-card/60 p-3 text-sm transition-colors hover:border-primary/40 hover:bg-card/80"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <IconComponent className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {entry.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                          {formatActivityType(entry.type)}
                        </Badge>
                        {entry.createdAt && (
                          <span>{formatActivityTime(entry.createdAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {t("activity.noActivityOn")} {selectedDate}
            </div>
          )}
        </Glass>
      )}
    </div>
  );
}
