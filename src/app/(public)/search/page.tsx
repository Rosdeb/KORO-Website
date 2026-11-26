"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon, X, Sparkles, CheckCircle2 } from "lucide-react";
import { LanguageCard } from "@/components/language/language-card";
import { CategoryCard } from "@/components/dictionary/category-card";
import { ConceptCard } from "@/components/dictionary/concept-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { useGlobalSearch } from "@/features/search/hooks";
import { useI18n } from "@/features/i18n/context";
import { ApiError } from "@/lib/api/client";
import { SearchAnimationLoader } from "@/components/search/search-animation-loader";

function SearchPageInner() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const { data, isLoading, isError, error, refetch } = useGlobalSearch(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  const totalResults = (data?.languages.length ?? 0) + (data?.concepts.length ?? 0) + (data?.categories.length ?? 0);

  return (
    <div className="container-koro pb-28 pt-8 sm:py-10 md:pb-10">
      <h1 className="text-2xl font-extrabold sm:text-3xl">{t("search.title")}</h1>

      <form onSubmit={handleSubmit} className="relative mt-5 max-w-xl">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-28 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear input"
            onClick={() => setQuery("")}
            className="absolute right-20 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 inline-flex h-9 items-center justify-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
        >
          {t("common.search")}
        </button>
      </form>

      <div className="mt-3 flex max-w-xl flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 font-medium text-foreground">
          <Sparkles className="size-3 text-accent" />
          Trending:
        </span>
        {["water", "family", "peace", "mother", "sun", "earth", "Bengali"].map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => {
              setQuery(term);
              router.push(`/search?q=${encodeURIComponent(term)}`);
            }}
            className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:border-accent/40 hover:bg-accent/10 hover:text-accent transition-all"
          >
            {term}
          </button>
        ))}
      </div>

      {!initialQuery && (
        <EmptyState className="mt-10" icon={SearchIcon} title={t("search.emptyTitle")} description={t("search.emptyDesc")} />
      )}

      {initialQuery && isError && (
        <ErrorState
          className="mt-10"
          title={error instanceof ApiError && error.status === 429 ? "Search limit reached" : undefined}
          description={error?.message || "Please try again."}
          onRetry={error instanceof ApiError && error.status === 429 ? undefined : () => refetch()}
        />
      )}

      {initialQuery && isLoading && !isError && (
        <div className="mt-10 max-w-xl animate-fade-in">
          <SearchAnimationLoader query={initialQuery} targetLangName="All Languages" />
        </div>
      )}

      {initialQuery && !isLoading && !isError && totalResults === 0 && (
        <EmptyState className="mt-10" icon={SearchIcon} title={`${t("search.noResults")} "${initialQuery}"`} description={t("languages.tryDifferent")} />
      )}

      {initialQuery && !isLoading && !isError && data && totalResults > 0 && (
        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <span className="flex size-2 rounded-full bg-accent" />
          <span>
            Found <strong className="text-foreground">{totalResults}</strong> result{totalResults === 1 ? "" : "s"} for{" "}
            <span className="font-semibold text-accent">&ldquo;{initialQuery}&rdquo;</span>
          </span>
        </div>
      )}

      {initialQuery && !isLoading && !isError && data && (
        <div className="mt-10 flex flex-col gap-12">
          {data.languages.length > 0 && (
            <ResultSection title={t("common.languages")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.languages.map((l) => (
                  <LanguageCard key={l.code} language={l} />
                ))}
              </div>
            </ResultSection>
          )}

          {data.categories.length > 0 && (
            <ResultSection title={t("common.categories")}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {data.categories.map((c) => (
                  <CategoryCard key={c.id} category={c} />
                ))}
              </div>
            </ResultSection>
          )}

          {data.concepts.length > 0 && (
            <ResultSection title={t("search.conceptsTranslations")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.concepts.map((c) => (
                  <ConceptCard key={c.id} concept={c} />
                ))}
              </div>
            </ResultSection>
          )}
        </div>
      )}
    </div>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-koro py-10"><Skeleton className="h-12 w-full max-w-xl rounded-full" /></div>}>
      <SearchPageInner />
    </Suspense>
  );
}
