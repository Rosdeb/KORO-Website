"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileDown, Download, History } from "lucide-react";
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
  const { data: book } = useBook(id);
  const { data: languages } = useLanguages();
  const { data: history, isLoading: historyLoading } = useExportHistory();
  const exportPdf = useExportPdf();
  const { toast } = useToast();
  const [languageCode, setLanguageCode] = useState("");

  const bookHistory = (history ?? []).filter((h) => h.bookId === id);

  async function handleExport() {
    if (!languageCode) return;
    try {
      const record = await exportPdf.mutateAsync({ collectionId: id, languageCode });
      toast({ title: "PDF ready", description: "Your book has been exported.", variant: "success" });
      window.open(record.fileUrl, "_blank", "noopener,noreferrer");
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
        <p className="mt-1 text-muted-foreground">Generate a printable PDF of {book?.title ?? "this book"}.</p>
      </div>

      <Card>
        <div className="flex flex-col gap-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Language</label>
            <Select value={languageCode} onValueChange={setLanguageCode}>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {(languages ?? []).map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleExport} loading={exportPdf.isPending} disabled={!languageCode} className="self-start">
            <FileDown className="size-4" /> Generate PDF
          </Button>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <History className="size-4" /> Export history
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
                    <p className="text-sm font-medium">{record.languageCode.toUpperCase()}</p>
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
