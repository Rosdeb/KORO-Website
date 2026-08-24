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

export default function BooksPage() {
  const { data: books, isLoading, isError, refetch } = useBooks();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">My Books</h1>
          <p className="mt-1 text-muted-foreground">Your personal vocabulary collections.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Create Book
        </Button>
      </div>

      {isError && <ErrorState onRetry={() => refetch()} />}

      {isLoading && !isError && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !isError && (books ?? []).length === 0 && (
        <EmptyState
          icon={BookMarked}
          title="No books yet"
          description="Create your first book to start saving words as you explore Koro."
          action={<Button onClick={() => setCreateOpen(true)}>Create Your First Book</Button>}
        />
      )}

      {!isLoading && !isError && (books ?? []).length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books!.map((book) => (
            <Link key={book.id} href={`/app/books/${book.id}`}>
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex flex-col gap-2 p-5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary">
                    <BookMarked className="size-5" />
                  </div>
                  <p className="font-semibold">{book.title}</p>
                  {book.description && <p className="text-sm text-muted-foreground">{book.description}</p>}
                  <p className="text-sm text-muted-foreground">{book.wordCount} words</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateBookDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
