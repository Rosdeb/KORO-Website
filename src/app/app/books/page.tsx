"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, BookMarked } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { CreateBookDialog } from "@/components/books/create-book-dialog";
import { useBooks } from "@/features/books/hooks";
import { useI18n } from "@/features/i18n/context";

export default function BooksPage() {
  const { t } = useI18n();
  const { data: books, isLoading, isError, refetch } = useBooks();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("books.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("books.subtitle")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> {t("books.createBook")}
        </Button>
      </div>

      {isError && <ErrorState onRetry={() => refetch()} />}

      {isLoading && !isError && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-52 overflow-hidden">
              <div className="flex h-full flex-col p-5">
                <Skeleton className="size-10 rounded-xl" />
                <Skeleton className="mt-3 h-5 w-2/3" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-auto h-4 w-20" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !isError && (books ?? []).length === 0 && (
        <EmptyState
          icon={BookMarked}
          title={t("books.noBooks")}
          description={t("books.noBooksDesc")}
          action={<Button onClick={() => setCreateOpen(true)}>{t("books.createFirstBook")}</Button>}
        />
      )}

      {!isLoading && !isError && (books ?? []).length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books!.map((book) => (
            <Link key={book.id} href={`/app/books/${book.id}`} className="block h-52">
              <Card className="h-52 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-full flex-col p-5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary">
                    <BookMarked className="size-5" />
                  </div>
                  <p className="mt-3 truncate font-semibold" title={book.title}>{book.title}</p>
                  {book.description ? (
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{book.description}</p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">{t("books.personalCollection")}</p>
                  )}
                  <p className="mt-auto pt-3 text-sm font-medium text-muted-foreground">
                    {typeof book.wordCount === "number" ? `${book.wordCount} ${t("books.wordsCount")}` : t("books.openBook")}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateBookDialog open={createOpen} onOpenChange={setCreateOpen} redirectOnCreate />
    </div>
  );
}
