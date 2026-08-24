"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Trash2, BookMarked, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { useBook, useRemoveBookItem } from "@/features/books/hooks";
import { scriptClassFor } from "@/lib/utils/script-font";
import type { BookItem } from "@/types";

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: book, isLoading, isError, refetch } = useBook(id);
  const removeItem = useRemoveBookItem();

  if (isLoading) {
    return <Skeleton className="h-64 rounded-3xl" />;
  }

  if (isError || !book) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const allItems = book.items;
  const chapters = groupByChapter(allItems);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/app/books" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> My Books
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{book.title}</h1>
          {book.description && <p className="mt-1 text-muted-foreground">{book.description}</p>}
          <p className="mt-1 text-sm text-muted-foreground">{book.wordCount} words</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/app/books/${id}/export`}>
            <Download className="size-4" /> Export as PDF
          </Link>
        </Button>
      </div>

      {allItems.length === 0 && (
        <EmptyState
          icon={BookMarked}
          title="This book is empty"
          description="Save words from the dictionary or translate page to add them here."
          action={
            <Link href="/dictionary" className="text-sm font-medium text-primary hover:underline">
              Explore Dictionary
            </Link>
          }
        />
      )}

      {chapters.map(([chapterName, items]) => (
        <div key={chapterName}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {chapterName}
          </h2>
          <Card>
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.conceptName}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={scriptClassFor(item.languageCode)}>{item.translationText}</span>
                      {item.pronunciation && (
                        <span className="inline-flex items-center gap-1">
                          <Volume2 className="size-3" /> {item.pronunciation}
                        </span>
                      )}
                    </div>
                    {item.note && <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>}
                  </div>
                  <button
                    aria-label="Remove word"
                    onClick={() => removeItem.mutate({ collectionId: id, itemId: item.id })}
                    className="rounded-full p-2 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ))}
    </div>
  );
}

// The backend attaches an optional free-text `chapter` label per item
// rather than managing chapter groups server-side, so grouping happens here.
function groupByChapter(items: BookItem[]) {
  const groups = new Map<string, BookItem[]>();
  for (const item of items) {
    const key = item.chapter?.trim() || "Words";
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return Array.from(groups.entries());
}
