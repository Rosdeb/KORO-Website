"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { ConceptCard } from "@/components/dictionary/concept-card";
import { CategoryIcon } from "@/components/dictionary/category-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { useCategories, useConceptsByCategory } from "@/features/dictionary/hooks";
import { useDebouncedValue } from "@/lib/utils/use-debounced-value";

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = use(params);
  const { data: categories } = useCategories();
  const category = categories?.find((c) => c.slug === categorySlug);

  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 300);

  const { data, isLoading, isError, refetch } = useConceptsByCategory(categorySlug, { q: debounced });

  return (
    <div className="container-koro py-10">
      <Link href="/dictionary" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Dictionary
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-accent-50 text-accent">
          <CategoryIcon slug={categorySlug} className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{category?.name ?? formatSlug(categorySlug)}</h1>
          {typeof category?.conceptCount === "number" && (
            <p className="text-sm text-muted-foreground">{category.conceptCount} words</p>
          )}
        </div>
      </div>

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search in ${category?.name ?? "this category"}...`}
          className="h-11 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {isError && <ErrorState className="mt-10" onRetry={() => refetch()} />}

      {isLoading && !isError && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !isError && data.length === 0 && (
        <EmptyState className="mt-10" title="No words found" description="Try a different search term." />
      )}

      {!isLoading && !isError && data.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((concept) => (
            <ConceptCard key={concept.id} concept={concept} />
          ))}
        </div>
      )}
    </div>
  );
}

function formatSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
