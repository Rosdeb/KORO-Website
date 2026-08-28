"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteBook } from "@/features/books/hooks";
import { useToast } from "@/components/ui/toast";

export function DeleteBookDialog({
  open,
  onOpenChange,
  bookId,
  bookTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  bookTitle: string;
}) {
  const deleteBook = useDeleteBook();
  const { toast } = useToast();
  const router = useRouter();

  async function handleDelete() {
    try {
      await deleteBook.mutateAsync(bookId);
      toast({ title: "Book deleted", variant: "success" });
      onOpenChange(false);
      router.push("/app/books");
    } catch {
      toast({ title: "Couldn't delete book", description: "Please try again.", variant: "error" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{bookTitle}&rdquo;?</DialogTitle>
          <DialogDescription>
            This permanently removes the book and every word saved in it. Exported PDFs you already
            generated are not affected. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteBook.isPending}>
            Delete book
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
