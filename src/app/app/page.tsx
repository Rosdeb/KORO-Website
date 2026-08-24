"use client";

import Link from "next/link";
import { Languages, Camera, BookMarked, MessageSquarePlus, ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { useAuth } from "@/features/auth/context";
import { useBooks } from "@/features/books/hooks";
import { useActivity } from "@/features/activity/hooks";

const QUICK_ACTIONS = [
  { href: "/app/translate", label: "Translate", icon: Languages },
  { href: "/app/scan", label: "Scan Object", icon: Camera },
  { href: "/app/books", label: "My Books", icon: BookMarked },
  { href: "/app/submissions/new", label: "Suggest Translation", icon: MessageSquarePlus },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: books, isLoading: booksLoading } = useBooks();
  const { data: activity, isLoading: activityLoading } = useActivity();

  const savedActivity = (activity ?? []).filter((a) => a.type === "SAVE").slice(0, 5);
  const recentActivity = (activity ?? []).slice(0, 6);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Welcome back, {user?.name?.split(" ")[0] ?? "there"}</h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s what&apos;s happening in your Koro learning space.</p>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="flex h-full flex-col items-center gap-2.5 p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
                  <action.icon className="size-5" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recently saved</h2>
            <Link href="/app/activity" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {activityLoading && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          )}
          {!activityLoading && savedActivity.length === 0 && (
            <EmptyState
              title="No saved words yet"
              description="Explore the dictionary and start building your first language book."
              action={
                <Link href="/dictionary" className="text-sm font-medium text-primary hover:underline">
                  Explore Dictionary
                </Link>
              }
            />
          )}
          {!activityLoading && savedActivity.length > 0 && (
            <Card>
              <ul className="divide-y divide-border">
                {savedActivity.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <Clock className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1">{entry.description}</span>
                    <span className="text-xs text-muted-foreground">{formatRelative(entry.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent activity</h2>
            <Link href="/app/activity" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {activityLoading && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          )}
          {!activityLoading && recentActivity.length === 0 && (
            <EmptyState title="No activity yet" description="Your recent actions on Koro will show up here." />
          )}
          {!activityLoading && recentActivity.length > 0 && (
            <Card>
              <ul className="divide-y divide-border">
                {recentActivity.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <Clock className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1">{entry.description}</span>
                    <span className="text-xs text-muted-foreground">{formatRelative(entry.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Continue learning</h2>
          <Link href="/app/books" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            My Books <ArrowRight className="size-3" />
          </Link>
        </div>
        {booksLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        )}
        {!booksLoading && (books ?? []).length === 0 && (
          <EmptyState
            title="No books yet"
            description="Create your first book to start saving words as you explore."
            action={
              <Link href="/app/books" className="text-sm font-medium text-primary hover:underline">
                Create Your First Book
              </Link>
            }
          />
        )}
        {!booksLoading && (books ?? []).length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {books!.slice(0, 3).map((book) => (
              <Link key={book.id} href={`/app/books/${book.id}`}>
                <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <p className="font-semibold">{book.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{book.wordCount} words</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
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
