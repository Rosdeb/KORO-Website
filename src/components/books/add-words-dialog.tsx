"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/state/empty-state";
import { useDictionarySearch } from "@/features/search/hooks";
import { useAddBookItem } from "@/features/books/hooks";
import { useToast } from "@/components/ui/toast";
import { scriptClassFor } from "@/lib/utils/script-font";
import { ApiError } from "@/lib/api/client";
import type { Concept } from "@/types";

interface AddWordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  bookTitle: string;
  /** Chapters that already exist in the book, offered as autocomplete. */
  existingChapters: string[];
  /** conceptId:languageId pairs already in the book, to show as "Added". */
  existingKeys: Set<string>;
}

export function AddWordsDialog({
  open,
  onOpenChange,
  bookId,
  bookTitle,
  existingChapters,
  existingKeys,
}: AddWordsDialogProps) {
  const [query, setQuery] = useState("");
  const [chapter, setChapter] = useState("General");
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const [addedCount, setAddedCount] = useState(0);

  const search = useDictionarySearch(query);
  const results = search.data ?? [];
  const trimmed = query.trim();

  // With keepPreviousData, `results` can still be the previous query's rows
  // while the new one loads. Treat "typed something but nothing to show yet"
  // as searching — this also covers the debounce gap before the request fires.
  const searching = trimmed.length > 0 && (search.isFetching || search.isPlaceholderData);
  const noResults = trimmed.length > 0 && results.length === 0 && !searching && !search.isError;

  const chapterOptions = useMemo(() => {
    const set = new Set(["General", ...existingChapters.filter(Boolean)]);
    return [...set];
  }, [existingChapters]);

  function markAdded(key: string, isNew: boolean) {
    setAddedKeys((prev) => new Set(prev).add(key));
    if (isNew) setAddedCount((n) => n + 1);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add words to {bookTitle}</DialogTitle>
          <DialogDescription>
            Search the dictionary and add entries straight into a chapter of this book.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any word, meaning or pronunciation..."
                className="h-10 w-full rounded-lg border border-input bg-card pl-10 pr-9 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            <div>
              <Input
                list="book-chapter-options"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="Chapter"
                aria-label="Chapter"
              />
              <datalist id="book-chapter-options">
                {chapterOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="max-h-[22rem] overflow-y-auto rounded-xl border border-border">
            {trimmed.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                Start typing to find words.
              </p>
            )}

            {results.length === 0 && searching && (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Searching…
              </div>
            )}

            {noResults && (
              <EmptyState
                className="py-10"
                title={`No words for "${trimmed}"`}
                description="Try a different spelling."
              />
            )}

            {trimmed.length > 0 && results.length > 0 && (
              <ul
                className={`divide-y divide-border transition-opacity ${
                  search.isPlaceholderData ? "opacity-60" : ""
                }`}
              >
                {results.map((concept) => (
                  <ResultRow
                    key={concept.id}
                    concept={concept}
                    bookId={bookId}
                    chapter={chapter.trim() || "General"}
                    existingKeys={existingKeys}
                    addedKeys={addedKeys}
                    onAdded={markAdded}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {addedCount > 0
              ? `${addedCount} ${addedCount === 1 ? "word" : "words"} added to this book`
              : "Added words appear in your book right away."}
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResultRow({
  concept,
  bookId,
  chapter,
  existingKeys,
  addedKeys,
  onAdded,
}: {
  concept: Concept;
  bookId: string;
  chapter: string;
  existingKeys: Set<string>;
  addedKeys: Set<string>;
  onAdded: (key: string, isNew: boolean) => void;
}) {
  const addItem = useAddBookItem();
  const { toast } = useToast();
  const [languageId, setLanguageId] = useState(concept.translations[0]?.languageId ?? "");

  const selected = concept.translations.find((t) => t.languageId === languageId) ?? concept.translations[0];
  const key = `${concept.id}:${languageId}`;
  const alreadyThere = existingKeys.has(key) || addedKeys.has(key);

  async function handleAdd() {
    if (!languageId) return;
    try {
      await addItem.mutateAsync({ collectionId: bookId, conceptId: concept.id, languageId, chapter });
      onAdded(key, true);
      toast({ title: `Added "${concept.name}"`, description: `Chapter: ${chapter}`, variant: "success" });
    } catch (error) {
      // The backend returns 400 when the concept/language pair is already in
      // the book — treat that as "already added" rather than a failure.
      if (error instanceof ApiError && error.status === 400) {
        onAdded(key, false);
        toast({ title: `"${concept.name}" is already in this book`, variant: "default" });
        return;
      }
      toast({ title: "Couldn't add this word", description: "Please try again.", variant: "error" });
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{concept.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {concept.categoryName || "Uncategorized"}
          {selected ? (
            <>
              {" · "}
              <span className={scriptClassFor(selected.languageCode)}>{selected.text}</span>
            </>
          ) : null}
        </p>
      </div>

      {concept.translations.length > 1 && (
        <Select value={languageId} onValueChange={setLanguageId}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {concept.translations.map((t) => (
              <SelectItem key={t.languageId} value={t.languageId}>
                {t.languageName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        size="sm"
        variant={alreadyThere ? "subtle" : "primary"}
        disabled={alreadyThere || !languageId}
        loading={addItem.isPending}
        onClick={handleAdd}
      >
        {alreadyThere ? <Check className="size-4" /> : <Plus className="size-4" />}
        {alreadyThere ? "Added" : "Add"}
      </Button>
    </li>
  );
}
