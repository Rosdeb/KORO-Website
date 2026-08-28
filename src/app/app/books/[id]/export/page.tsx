"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileDown, Download, History, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { useBook } from "@/features/books/hooks";
import { useLanguages } from "@/features/languages/hooks";
import { useExportHistory, useExportPdf } from "@/features/export/hooks";
import { useToast } from "@/components/ui/toast";

export default function BookExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: book, isLoading: bookLoading } = useBook(id);
  const { data: languages, isLoading: languagesLoading } = useLanguages();
  const { data: history, isLoading: historyLoading } = useExportHistory();
  const exportPdf = useExportPdf();
  const { toast } = useToast();
  const [languageId, setLanguageId] = useState("");

  const bookHistory = (history ?? []).filter((h) => h.bookId === id);
  const wordCount = book?.items.length ?? 0;
  const isEmpty = !bookLoading && wordCount === 0;

  async function handleExport() {
    if (!languageId) return;
    try {
      const record = await exportPdf.mutateAsync({ collectionId: id, languageId });
      toast({ title: "PDF ready", description: "Opening your download…", variant: "success" });
      const opened = window.open(record.fileUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        toast({
          title: "Pop-up blocked",
          description: "Use the Download link in Export history below.",
          variant: "default",
        });
      }
    } catch {
      toast({ title: "Export failed", description: "Please try again.", variant: "error" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/app/books/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {book?.title ?? "Book"}
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Export as PDF</h1>
        <p className="mt-1 text-muted-foreground">
          {bookLoading ? (
            "Loading book…"
          ) : (
            <>
              Generate a printable PDF of <span className="font-medium text-foreground">{book?.title}</span> —{" "}
              {wordCount} {wordCount === 1 ? "word" : "words"}.
            </>
          )}
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-5 p-6">
          {isEmpty ? (
            <EmptyState
              className="py-4"
              title="This book has no words yet"
              description="Add some words before exporting."
              action={
                <Button asChild variant="outline">
                  <Link href={`/app/books/${id}`}>Back to book</Link>
                </Button>
              }
            />
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Language</label>
                <Select value={languageId} onValueChange={setLanguageId} disabled={languagesLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={languagesLoading ? "Loading languages…" : "Select a language"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(languages ?? []).map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  The PDF lists each word with its translation in the language you pick.
                </p>
              </div>
              <Button
                onClick={handleExport}
                loading={exportPdf.isPending}
                disabled={!languageId || bookLoading}
                className="self-start"
              >
                <FileDown className="size-4" />
                {exportPdf.isPending ? "Generating PDF…" : "Generate PDF"}
              </Button>
            </>
          )}
        </div>
      </Card>

      <div>
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <History className="size-4" /> Export history
          {exportPdf.isPending && <Loader2 className="size-3.5 animate-spin" />}
        </h2>
        {historyLoading && <Skeleton className="h-24 rounded-2xl" />}
        {!historyLoading && bookHistory.length === 0 && (
          <EmptyState title="No exports yet" description="Your generated PDFs will appear here." />
        )}
        {!historyLoading && bookHistory.length > 0 && (
          <Card>
            <ul className="divide-y divide-border">
              {bookHistory.map((record) => (
                <li key={record.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium">{record.fileName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleString()}</p>
                  </div>
                  <a
                    href={record.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <Download className="size-3.5" /> Download
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
