"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Hash, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/state/error-state";
import { EmptyState } from "@/components/state/empty-state";
import { CategoryCard } from "@/components/dictionary/category-card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/features/languages/hooks";
import { useCategories, usePopularConcepts } from "@/features/dictionary/hooks";
import { useTranslationSearch } from "@/features/translations/hooks";
import { scriptClassFor } from "@/lib/utils/script-font";

export default function LanguageDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { data: language, isLoading, isError, refetch } = useLanguage(code);
  const { data: categories } = useCategories();
  const { data: popularConcepts } = usePopularConcepts();
  const [query, setQuery] = useState("");
  const search = useTranslationSearch();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !language) return;
    search.mutate({ query: query.trim(), targetLanguageId: language.id });
  }

  if (isLoading) {
    return (
      <div className="container-koro py-12">
        <Skeleton className="h-40 rounded-3xl" />
      </div>
    );
  }

  if (isError || !language) {
    return (
      <div className="container-koro py-12">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const popularInThisLanguage = (popularConcepts ?? [])
    .map((c) => ({ concept: c, translation: c.translations.find((t) => t.languageCode === code) }))
    .filter((c) => c.translation);

  return (
    <div>
      <section className="border-b border-border bg-primary-50/60">
        <div className="container-koro py-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{language.name}</p>
              <h1 className={`text-4xl font-extrabold sm:text-5xl ${scriptClassFor(language.code)}`}>
                {language.nativeName}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" /> {language.region}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Hash className="size-3.5" /> {language.code.toUpperCase()}
                </span>
                {typeof language.conceptCount === "number" && <Badge variant="primary">{language.conceptCount} concepts</Badge>}
              </div>
              {language.description && (
                <p className="mt-4 max-w-xl text-muted-foreground">{language.description}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative mt-8 max-w-lg">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search words and concepts..."
              className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-24 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 h-9 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              {search.isPending ? <Loader2 className="size-4 animate-spin" /> : "Search"}
            </button>
          </form>

          {search.data && (
            <div className="mt-4 max-w-lg rounded-2xl border border-border bg-card p-2 shadow-sm">
              {search.data.length === 0 && (
                <p className="px-3 py-4 text-sm text-muted-foreground">No results in {language.name}.</p>
              )}
              {search.data.map(({ concept, translation }) => (
                <Link
                  key={concept.id}
                  href={`/dictionary/${concept.categorySlug}/${concept.slug}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-muted"
                >
                  <span className="text-sm font-medium">{concept.name}</span>
                  <span className={`text-sm text-primary ${scriptClassFor(code)}`}>{translation.text}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-koro py-14">
        <h2 className="text-xl font-bold">Categories</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(categories ?? []).map((cat) => (
            <CategoryCard key={cat.id} category={cat} basePath={`/dictionary`} />
          ))}
        </div>
      </section>

      <section className="container-koro pb-16">
        <h2 className="text-xl font-bold">Popular concepts in {language.name}</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularInThisLanguage.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState title="No popular concepts yet" description="Browse the dictionary to discover more." />
            </div>
          )}
          {popularInThisLanguage.map(({ concept, translation }) => (
            <Link
              key={concept.id}
              href={`/dictionary/${concept.categorySlug}/${concept.slug}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="font-medium">{concept.name}</span>
              <span className={`text-primary ${scriptClassFor(code)}`}>{translation!.text}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
