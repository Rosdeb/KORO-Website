"use client";

import { useMemo, useState } from "react";
import { Search, Shapes } from "lucide-react";
import { CategoryCard } from "@/components/dictionary/category-card";
import { ConceptCard } from "@/components/dictionary/concept-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { useCategories, usePopularConcepts, useTranslationsCount } from "@/features/dictionary/hooks";
import { useDictionarySearch } from "@/features/search/hooks";
import { useI18n } from "@/features/i18n/context";

export default function DictionaryPage() {
  const { t, locale } = useI18n();
  const { data: categories, isLoading, isError, refetch } = useCategories();
  const { data: popularConcepts, isLoading: popularLoading } = usePopularConcepts();
  const { data: translationsCount } = useTranslationsCount();
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;

  // Real backend concept search (Bangla, pronunciation and source-language
  // words — not just the English name), grouped into concept cards.
  const conceptSearch = useDictionarySearch(query);
  const conceptResults = conceptSearch.data ?? [];

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  return (
    <div className="container-koro py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t("dictionary.title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("dictionary.subtitle")}
          {translationsCount !== undefined ? ` ${locale === "bn" ? `${translationsCount}-এরও বেশি অনুবাদ উপলব্ধ।` : `Over ${translationsCount} translations available.`}` : ""}
        </p>
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("dictionary.searchPlaceholder")}
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

      {!isLoading && !isError && filteredCategories.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("dictionary.categories")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      )}

      {searching && !isError && (
        <div className="mt-14">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("dictionary.concepts")}</h2>
          {conceptSearch.isError ? (
            <ErrorState onRetry={() => conceptSearch.refetch()} />
          ) : conceptSearch.isLoading || (!conceptSearch.data && !conceptSearch.isError) ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : conceptResults.length === 0 && filteredCategories.length === 0 ? (
            <EmptyState
              icon={Shapes}
              title={`${t("search.noResults")} "${query.trim()}"`}
              description={t("languages.tryDifferent")}
            />
          ) : conceptResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("dictionary.noResults")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {conceptResults.map((concept) => (
                <ConceptCard key={concept.id} concept={concept} />
              ))}
            </div>
          )}
        </div>
      )}

      {!searching && (
        <div className="mt-14">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("dictionary.popular")}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularLoading &&
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            {!popularLoading && (popularConcepts ?? []).length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3">
                <EmptyState title={t("home.noWords")} description={t("home.checkBack")} />
              </div>
            )}
            {!popularLoading && (popularConcepts ?? []).slice(0, 6).map((concept) => (
              <ConceptCard key={concept.id} concept={concept} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
