"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateBook } from "@/features/books/hooks";
import { useToast } from "@/components/ui/toast";

export function CreateBookDialog({
  open,
  onOpenChange,
  redirectOnCreate = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectOnCreate?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createBook = useCreateBook();
  const { toast } = useToast();
  const router = useRouter();

  async function handleCreate() {
    if (!title.trim()) return;
    try {
      const book = await createBook.mutateAsync({ title: title.trim(), description: description.trim() || undefined });
      toast({ title: "Book created", variant: "success" });
      setTitle("");
      setDescription("");
      onOpenChange(false);
      if (redirectOnCreate) router.push(`/app/books/${book.id}`);
    } catch {
      toast({ title: "Couldn't create book", description: "Please try again.", variant: "error" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new book</DialogTitle>
          <DialogDescription>Give your personal vocabulary collection a name.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="book-title">Title</Label>
            <Input
              id="book-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Travel Words"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="book-description">Description (optional)</Label>
            <Textarea
              id="book-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this book for?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={createBook.isPending} disabled={!title.trim()}>
            Create Book
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
