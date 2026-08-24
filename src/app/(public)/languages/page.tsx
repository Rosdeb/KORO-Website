"use client";

import { useMemo, useState } from "react";
import { Languages as LanguagesIcon, Search } from "lucide-react";
import { LanguageCard } from "@/components/language/language-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { useLanguages } from "@/features/languages/hooks";

export default function LanguagesPage() {
  const { data: languages, isLoading, isError, refetch } = useLanguages();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!languages) return [];
    const q = query.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q),
    );
  }, [languages, query]);

  const popular = filtered.filter((l) => l.popular);
  const rest = filtered.filter((l) => !l.popular);

  return (
    <div className="container-koro py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Languages</h1>
        <p className="mt-2 text-muted-foreground">
          Browse every language available on Koro — native names, regions, and ISO codes.
        </p>
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search languages..."
            className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {isError && <ErrorState className="mt-10" onRetry={() => refetch()} />}

      {isLoading && !isError && (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          className="mt-10"
          icon={LanguagesIcon}
          title="No languages found"
          description="Try a different search term."
        />
      )}

      {!isLoading && !isError && popular.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Popular</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((lang) => (
              <LanguageCard key={lang.code} language={lang} />
            ))}
          </div>
        </div>
      )}

      {!isLoading && !isError && rest.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {popular.length > 0 ? "All languages" : "Languages"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((lang) => (
              <LanguageCard key={lang.code} language={lang} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
