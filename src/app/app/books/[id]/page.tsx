"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Trash2,
  BookMarked,
  Volume2,
  Plus,
  MoreVertical,
  Pencil,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { useToast } from "@/components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddWordsDialog } from "@/components/books/add-words-dialog";
import { EditBookDialog } from "@/components/books/edit-book-dialog";
import { DeleteBookDialog } from "@/components/books/delete-book-dialog";
import { useBook, useRemoveBookItem } from "@/features/books/hooks";
import { scriptClassFor } from "@/lib/utils/script-font";
import type { BookItem } from "@/types";

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: book, isLoading, isError, isFetching, refetch } = useBook(id);
  const removeItem = useRemoveBookItem();
  const { toast } = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const items = useMemo(() => book?.items ?? [], [book]);
  const chapters = useMemo(() => groupByChapter(items), [items]);
  const existingChapters = useMemo(() => chapters.map(([name]) => name), [chapters]);
  const existingKeys = useMemo(
    () => new Set(items.map((it) => `${it.conceptId}:${it.languageId}`)),
    [items],
  );

  if (isLoading) {
    return <BookDetailSkeleton />;
  }

  if (isError || !book) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  function handleRemove(item: BookItem) {
    removeItem.mutate(
      { collectionId: id, itemId: item.id },
      {
        onSuccess: () => toast({ title: `Removed "${item.conceptName}"`, variant: "success" }),
        onError: () =>
          toast({
            title: "Couldn't remove this word",
            description: "It's still in your book — please try again.",
            variant: "error",
          }),
      },
    );
  }

  // Background refresh (not the first load) — e.g. coming back to the tab.
  const refreshing = isFetching && !isLoading;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link href="/app/books" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> My Books
      </Link>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary">
                <BookMarked className="size-6" />
              </div>
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-extrabold sm:text-3xl">{book.title}</h1>
                {book.description && (
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{book.description}</p>
                )}
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span>
                    {items.length} {items.length === 1 ? "word" : "words"}
                    {chapters.length > 1 && ` · ${chapters.length} chapters`}
                  </span>
                  {refreshing && (
                    <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground/70">
                      <Loader2 className="size-3 animate-spin" /> Syncing
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="size-4" /> Add words
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/app/books/${id}/export`}>
                  <Download className="size-4" /> Export as PDF
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Book options">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                    <Pencil className="size-4" /> Edit details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setDeleteOpen(true)}
                    className="text-danger focus:bg-danger/10 focus:text-danger"
                  >
                    <Trash2 className="size-4" /> Delete book
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>

      {items.length === 0 && (
        <EmptyState
          icon={BookMarked}
          title="This book is empty"
          description="Add words from the dictionary to start building your book."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" /> Add words
            </Button>
          }
        />
      )}

      {chapters.map(([chapterName, chapterItems]) => (
        <div key={chapterName}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {chapterName}
            <span className="ml-2 font-normal normal-case text-muted-foreground/70">{chapterItems.length}</span>
          </h2>
          <Card className="overflow-hidden">
            <ul className="divide-y divide-border">
              {chapterItems.map((item) => (
                <li key={item.id} className="flex items-start gap-4 px-5 py-4 sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.conceptName}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground/70">
                        {item.languageName}
                      </span>
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
                    aria-label={`Remove ${item.conceptName}`}
                    onClick={() => handleRemove(item)}
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ))}

      <AddWordsDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        bookId={id}
        bookTitle={book.title}
        existingChapters={existingChapters}
        existingKeys={existingKeys}
      />
      <EditBookDialog open={editOpen} onOpenChange={setEditOpen} book={book} />
      <DeleteBookDialog open={deleteOpen} onOpenChange={setDeleteOpen} bookId={id} bookTitle={book.title} />
    </div>
  );
}

function BookDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6" aria-busy="true">
      <Skeleton className="h-5 w-24" />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="flex flex-1 items-start gap-4">
            <Skeleton className="size-12 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-11 w-32 rounded-full" />
            <Skeleton className="h-11 w-36 rounded-full" />
          </div>
        </div>
      </Card>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="size-8 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// The backend attaches an optional free-text `chapter` label per item rather
// than managing chapter groups server-side, so grouping happens here. Chapters
// keep first-seen order; items inside a chapter are ordered by `displayOrder`
// then alphabetically.
function groupByChapter(items: BookItem[]): [string, BookItem[]][] {
  const groups = new Map<string, BookItem[]>();
  for (const item of items) {
    const key = item.chapter?.trim() || "General";
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  for (const list of groups.values()) {
    list.sort(
      (a, b) =>
        (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
        a.conceptName.localeCompare(b.conceptName),
    );
  }
  return [...groups.entries()];
}
