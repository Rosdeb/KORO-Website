"use client";

import Link from "next/link";
import {
  Languages,
  Camera,
  BookMarked,
  MessageSquarePlus,
  ArrowRight,
  Bookmark,
  Activity,
  BookOpen,
  Globe,
  FileDown,
  Search,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { useAuth } from "@/features/auth/context";
import { useBooks } from "@/features/books/hooks";
import { useActivity } from "@/features/activity/hooks";
import { useI18n } from "@/features/i18n/context";
import { ActivityType } from "@/types";
import { cn } from "@/lib/utils/cn";

function getGreetingKey() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "dashboard.greetingMorning" as const;
  if (hour >= 12 && hour < 17) return "dashboard.greetingAfternoon" as const;
  if (hour >= 17 && hour < 21) return "dashboard.greetingEvening" as const;
  return "dashboard.greetingNight" as const;
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "TRANSLATION": return { icon: Languages, cls: "bg-accent/10 text-accent" };
    case "SAVE_WORD": return { icon: Bookmark, cls: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" };
    case "SEARCH": return { icon: Search, cls: "bg-muted text-muted-foreground" };
    case "IMAGE_RECOGNITION":
    case "IMAGE_UPLOAD": return { icon: Camera, cls: "bg-orange-100 text-orange-500 dark:bg-orange-900/40 dark:text-orange-400" };
    case "EXPORT_PDF":
    case "DOWNLOAD_BOOK": return { icon: FileDown, cls: "bg-muted text-muted-foreground" };
    default: return { icon: Clock, cls: "bg-muted text-muted-foreground" };
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data: books, isLoading: booksLoading } = useBooks();
  const { data: activity, isLoading: activityLoading } = useActivity();

  const activityEntries = activity?.content ?? [];
  const savedActivity = activityEntries.filter((a) => a.type === "SAVE_WORD").slice(0, 5);
  const recentActivity = activityEntries.slice(0, 6);

  const greeting = t(getGreetingKey());

  const quickActions = [
    { href: "/app/translate", label: t("nav.translate"), icon: Languages },
    { href: "/app/scan", label: t("nav.scan"), icon: Camera },
    { href: "/app/books", label: t("nav.books"), icon: BookMarked },
    { href: "/app/submissions/new", label: t("nav.suggestTranslation"), icon: MessageSquarePlus },
  ];

  return (
    <div className="flex flex-col gap-10">

      {/* ── Welcome ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" asChild className="w-fit shrink-0">
          <Link href="/">
            <Globe className="size-4" />
            {t("nav.backToWebsite")}
          </Link>
        </Button>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("dashboard.quickActions")}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-3 py-6 text-sm font-medium transition-colors hover:border-accent/40 hover:bg-muted/30 sm:py-7"
            >
              <div className="flex size-12 items-center justify-center rounded-md bg-muted transition-colors group-hover:bg-accent">
                <action.icon className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-foreground" />
              </div>
              <span className="text-center text-sm font-medium leading-tight text-foreground">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Continue Learning ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("dashboard.continueLearning")}
            </p>
          </div>
          <Link href="/app/books" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("dashboard.myBooks")} <ArrowRight className="size-3" />
          </Link>
        </div>

        {booksLoading && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        )}

        {!booksLoading && (books ?? []).length === 0 && (
          <EmptyState
            icon={BookMarked}
            title={t("dashboard.noBooksTitle")}
            description={t("dashboard.noBooksDesc")}
            action={
              <Button size="sm" asChild>
                <Link href="/app/books">{t("dashboard.createFirstBook")}</Link>
              </Button>
            }
          />
        )}

        {!booksLoading && (books ?? []).length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {books!.slice(0, 3).map((book) => (
              <Link key={book.id} href={`/app/books/${book.id}`} className="group block">
                <Card className="flex h-full flex-col justify-between p-5 transition-colors hover:border-accent/40 hover:bg-muted/30">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground">{book.title}</p>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    {book.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{book.description}</p>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {book.wordCount ?? book.items?.length ?? 0} {book.wordCount === 1 ? t("dashboard.wordCount") : t("dashboard.wordsCount")}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Activity columns ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Recently Saved */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Bookmark className="size-4 text-accent" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("dashboard.recentlySaved")}
              </p>
            </div>
            <Link href="/app/activity" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("dashboard.viewAll")}
            </Link>
          </div>
          {activityLoading ? (
            <div className="flex flex-col divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="size-7 rounded-lg shrink-0" />
                  <Skeleton className="h-3.5 flex-1 rounded" />
                  <Skeleton className="h-3 w-10 rounded" />
                </div>
              ))}
            </div>
          ) : savedActivity.length === 0 ? (
            <EmptyState
              className="flex-1 min-h-[160px]"
              icon={Bookmark}
              title={t("dashboard.noSavedWordsTitle")}
              description={t("dashboard.noSavedWordsDesc")}
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dictionary">{t("dashboard.exploreDictionary")}</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {savedActivity.map((entry) => {
                const { icon: Icon, cls } = getActivityIcon(entry.type);
                return (
                  <li key={entry.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", cls)}>
                      <Icon className="size-3.5" />
                    </div>
                    <span className="flex-1 truncate text-sm font-medium">{entry.description}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatRelative(entry.createdAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent Activity */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-accent" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("dashboard.recentActivity")}
              </p>
            </div>
            <Link href="/app/activity" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("dashboard.viewAll")}
            </Link>
          </div>
          {activityLoading ? (
            <div className="flex flex-col divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="size-7 rounded-lg shrink-0" />
                  <Skeleton className="h-3.5 flex-1 rounded" />
                  <Skeleton className="h-3 w-10 rounded" />
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <EmptyState
              className="flex-1 min-h-[160px]"
              icon={Activity}
              title={t("dashboard.noActivityTitle")}
              description={t("dashboard.noActivityDesc")}
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link href="/app/translate">{t("dashboard.startTranslating")}</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {recentActivity.map((entry) => {
                const { icon: Icon, cls } = getActivityIcon(entry.type);
                return (
                  <li key={entry.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", cls)}>
                      <Icon className="size-3.5" />
                    </div>
                    <span className="flex-1 truncate text-sm font-medium">{entry.description}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatRelative(entry.createdAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

function formatRelative(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}
