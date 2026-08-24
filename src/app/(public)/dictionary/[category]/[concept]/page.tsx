"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/state/error-state";
import { Card } from "@/components/ui/card";
import { SaveToBookButton } from "@/components/save-to-book/save-to-book-button";
import { useConcept } from "@/features/dictionary/hooks";
import { scriptClassFor } from "@/lib/utils/script-font";

export default function ConceptDetailPage({
  params,
}: {
  params: Promise<{ category: string; concept: string }>;
}) {
  const { category, concept: conceptSlug } = use(params);
  const { data: concept, isLoading, isError, refetch } = useConcept(category, conceptSlug);

  if (isLoading) {
    return (
      <div className="container-koro py-10">
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (isError || !concept) {
    return (
      <div className="container-koro py-10">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="container-koro max-w-3xl py-10">
      <Link
        href={`/dictionary/${category}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to category
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">{concept.name}</h1>
        <SaveToBookButton concept={concept} />
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {concept.translations.map((t) => (
          <Card key={t.languageCode}>
            <div className="flex flex-col gap-3 p-6">
              <div className="flex items-center justify-between">
                <Link
                  href={`/languages/${t.languageCode}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {t.languageName}
                </Link>
                {t.pronunciation && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Volume2 className="size-3.5" /> {t.pronunciation}
                  </span>
                )}
              </div>
              <p className={`text-3xl ${scriptClassFor(t.languageCode)}`}>{t.text}</p>
              {t.example && <p className="text-sm text-muted-foreground">&ldquo;{t.example}&rdquo;</p>}
            </div>
          </Card>
        ))}

        {concept.translations.length === 0 && (
          <Card>
            <p className="p-6 text-sm text-muted-foreground">
              No translations available for this word yet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
