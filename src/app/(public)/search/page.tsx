"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { LanguageCard } from "@/components/language/language-card";
import { CategoryCard } from "@/components/dictionary/category-card";
import { ConceptCard } from "@/components/dictionary/concept-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { useGlobalSearch } from "@/features/search/hooks";

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const { data, isLoading, isError, refetch } = useGlobalSearch(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  const totalResults = (data?.languages.length ?? 0) + (data?.concepts.length ?? 0) + (data?.categories.length ?? 0);

  return (
    <div className="container-koro py-10">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Search</h1>

      <form onSubmit={handleSubmit} className="relative mt-5 max-w-xl">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search languages, words, and concepts..."
          className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </form>

      {!initialQuery && (
        <EmptyState className="mt-10" icon={SearchIcon} title="Search Koro" description="Try searching for a language, a word, or a category." />
      )}

      {initialQuery && isError && <ErrorState className="mt-10" onRetry={() => refetch()} />}

      {initialQuery && isLoading && !isError && (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {initialQuery && !isLoading && !isError && totalResults === 0 && (
        <EmptyState className="mt-10" icon={SearchIcon} title={`No results for "${initialQuery}"`} description="Try a different search term." />
      )}

      {initialQuery && !isLoading && !isError && data && (
        <div className="mt-10 flex flex-col gap-12">
          {data.languages.length > 0 && (
            <ResultSection title="Languages">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.languages.map((l) => (
                  <LanguageCard key={l.code} language={l} />
                ))}
              </div>
            </ResultSection>
          )}

          {data.categories.length > 0 && (
            <ResultSection title="Categories">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {data.categories.map((c) => (
                  <CategoryCard key={c.id} category={c} />
                ))}
              </div>
            </ResultSection>
          )}

          {data.concepts.length > 0 && (
            <ResultSection title="Concepts & Translations">
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
