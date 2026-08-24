"use client";

import { useState } from "react";
import { BookPlus, Loader2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBooks, useCreateBook, useAddBookItem } from "@/features/books/hooks";
import { useToast } from "@/components/ui/toast";
import type { Concept } from "@/types";

interface SaveToBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  concept: Concept;
  defaultLanguageId?: string;
  onSaved?: () => void;
}

export function SaveToBookDialog({
  open,
  onOpenChange,
  concept,
  defaultLanguageId,
  onSaved,
}: SaveToBookDialogProps) {
  const { data: books, isLoading } = useBooks();
  const createBook = useCreateBook();
  const addItem = useAddBookItem();
  const { toast } = useToast();

  const [languageId, setLanguageId] = useState(defaultLanguageId ?? concept.translations[0]?.languageId ?? "");
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [newBookTitle, setNewBookTitle] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);

  const hasBooks = !!books && books.length > 0;

  async function handleSave() {
    try {
      let bookId = selectedBookId;
      if (creatingNew || !hasBooks) {
        if (!newBookTitle.trim()) return;
        const book = await createBook.mutateAsync({ title: newBookTitle.trim() });
        bookId = book.id;
      }
      if (!bookId || !languageId) return;
      await addItem.mutateAsync({ collectionId: bookId, conceptId: concept.id, languageId });
      toast({ title: "Saved to book", variant: "success" });
      onSaved?.();
      onOpenChange(false);
    } catch {
      toast({ title: "Couldn't save this word", description: "Please try again.", variant: "error" });
    }
  }

  const saving = createBook.isPending || addItem.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save &ldquo;{concept.name}&rdquo;</DialogTitle>
          <DialogDescription>Choose a language and a book to save this word into.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {concept.translations.length > 1 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">Language</label>
              <Select value={languageId} onValueChange={setLanguageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {concept.translations.map((t) => (
                    <SelectItem key={t.languageId} value={t.languageId}>
                      {t.languageName} — {t.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}

          {!isLoading && hasBooks && !creatingNew && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">Book</label>
              <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  {books!.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.title} ({b.wordCount} words)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => setCreatingNew(true)}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <BookPlus className="size-3.5" /> Create a new book instead
              </button>
            </div>
          )}

          {!isLoading && (!hasBooks || creatingNew) && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {hasBooks ? "New book title" : "You don't have a book yet — name your first one"}
              </label>
              <Input
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                placeholder="My Travel Words"
                autoFocus
              />
              {hasBooks && (
                <button
                  type="button"
                  onClick={() => setCreatingNew(false)}
                  className="mt-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Choose an existing book instead
                </button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving} disabled={!languageId}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
