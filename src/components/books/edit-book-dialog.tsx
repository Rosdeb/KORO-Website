"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateBook } from "@/features/books/hooks";
import { useToast } from "@/components/ui/toast";
import type { Book } from "@/types";

export function EditBookDialog({
  open,
  onOpenChange,
  book,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit book</DialogTitle>
          <DialogDescription>Update the title and description of this book.</DialogDescription>
        </DialogHeader>
        {/* Mounted fresh each time the dialog opens, so the fields always start
            from the current book values without a syncing effect. */}
        {open && <EditBookForm book={book} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function EditBookForm({ book, onDone }: { book: Book; onDone: () => void }) {
  const [title, setTitle] = useState(book.title);
  const [description, setDescription] = useState(book.description ?? "");
  const updateBook = useUpdateBook();
  const { toast } = useToast();

  async function handleSave() {
    if (!title.trim()) return;
    try {
      await updateBook.mutateAsync({
        id: book.id,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      toast({ title: "Book updated", variant: "success" });
      onDone();
    } catch {
      toast({ title: "Couldn't update book", description: "Please try again.", variant: "error" });
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-book-title">Title</Label>
          <Input id="edit-book-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-book-description">Description (optional)</Label>
          <Textarea
            id="edit-book-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this book for?"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={updateBook.isPending} disabled={!title.trim()}>
          Save changes
        </Button>
      </DialogFooter>
    </>
  );
}
