"use client";

import { useState } from "react";
import { ArrowLeftRight, Search, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { SaveToBookButton } from "@/components/save-to-book/save-to-book-button";
import { useLanguages } from "@/features/languages/hooks";
import { useTranslationSearch } from "@/features/translations/hooks";
import { scriptClassFor } from "@/lib/utils/script-font";

export default function TranslatePage() {
  const { data: languages, isLoading: languagesLoading } = useLanguages();
  const [toLanguage, setToLanguage] = useState<string>("");
  const [query, setQuery] = useState("");
  const search = useTranslationSearch();

  const effectiveToLanguage = toLanguage || languages?.[0]?.code || "";
  const targetLanguage = languages?.find((l) => l.code === effectiveToLanguage);
  const sourceLanguage = languages?.find((l) => l.code === "en");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !targetLanguage) return;
    search.mutate({ query: query.trim(), sourceLanguageId: sourceLanguage?.id, targetLanguageId: targetLanguage.id });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Translate & Search</h1>
        <p className="mt-1 text-muted-foreground">Look up any concept and see it translated instantly.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">From</label>
              <Select value="en" disabled>
                <SelectTrigger>
                  <SelectValue>English</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="hidden justify-center pb-2.5 sm:flex">
              <ArrowLeftRight className="size-4 text-muted-foreground" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">To</label>
              <Select value={effectiveToLanguage} onValueChange={setToLanguage} disabled={languagesLoading}>
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
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concept..."
              className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-28 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="sm" className="absolute right-1.5 top-1.5" loading={search.isPending}>
              Search
            </Button>
          </div>
        </form>
      </Card>

      {search.isPending && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      )}

      {search.isSuccess && search.data.length === 0 && (
        <EmptyState title="No matches found" description="Try a different word or concept." />
      )}

      {search.isSuccess && search.data.length > 0 && (
        <div className="flex flex-col gap-4">
          {search.data.map(({ concept, translation }) => (
            <Card key={concept.id}>
              <div className="flex flex-col gap-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Concept</p>
                    <p className="text-lg font-bold">{concept.name}</p>
                  </div>
                  <SaveToBookButton
                    concept={{
                      id: concept.id,
                      slug: concept.slug,
                      name: concept.name,
                      categoryId: "",
                      categoryName: "",
                      categorySlug: concept.categorySlug,
                      translations: [translation],
                    }}
                    defaultLanguageId={translation.languageId}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Translation</p>
                  <p className={`text-2xl text-primary ${scriptClassFor(translation.languageCode)}`}>
                    {translation.text}
                  </p>
                </div>

                {translation.pronunciation && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pronunciation</p>
                    <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Volume2 className="size-3.5" /> {translation.pronunciation}
                    </p>
                  </div>
                )}

                {translation.notes && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
                    <p className="text-sm text-muted-foreground">{translation.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
