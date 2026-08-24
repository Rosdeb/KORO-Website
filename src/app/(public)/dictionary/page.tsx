"use client";

import { useMemo, useState } from "react";
import { Search, Shapes } from "lucide-react";
import { CategoryCard } from "@/components/dictionary/category-card";
import { ConceptCard } from "@/components/dictionary/concept-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { useCategories, usePopularConcepts } from "@/features/dictionary/hooks";

export default function DictionaryPage() {
  const { data: categories, isLoading, isError, refetch } = useCategories();
  const { data: popularConcepts, isLoading: popularLoading } = usePopularConcepts();
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  return (
    <div className="container-koro py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Dictionary</h1>
        <p className="mt-2 text-muted-foreground">
          Browse concepts by category and see translations across every language on Koro.
        </p>
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts..."
            className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {isError && <ErrorState className="mt-10" onRetry={() => refetch()} />}

      {isLoading && !isError && (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !isError && filteredCategories.length === 0 && (
        <EmptyState className="mt-10" icon={Shapes} title="No categories found" description="Try a different search term." />
      )}

      {!isLoading && !isError && filteredCategories.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Categories</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-14">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Popular concepts</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularLoading &&
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          {!popularLoading && (popularConcepts ?? []).length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState title="No popular concepts yet" description="Check back soon." />
            </div>
          )}
          {!popularLoading && (popularConcepts ?? []).slice(0, 6).map((concept) => (
            <ConceptCard key={concept.id} concept={concept} />
          ))}
        </div>
      </div>
    </div>
  );
}
