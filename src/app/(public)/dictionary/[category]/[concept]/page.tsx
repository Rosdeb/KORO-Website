"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/state/error-state";
import { Card } from "@/components/ui/card";
import { SaveToBookButton } from "@/components/save-to-book/save-to-book-button";
import { useConcept } from "@/features/dictionary/hooks";
import { scriptClassFor } from "@/lib/utils/script-font";
import { TtsSpeechButton } from "@/components/ui/tts-speech-button";
import { PronunciationPlayer } from "@/components/dictionary/pronunciation-player";

export default function ConceptDetailPage({
  params,
}: {
  params: Promise<{ category: string; concept: string }>;
}) {
  const { category, concept: conceptId } = use(params);
  const { data: concept, isLoading, isError, refetch } = useConcept(conceptId);

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
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">{concept.name}</h1>
          <TtsSpeechButton
            text={concept.name}
            langCode="en"
            label={`Listen to English: ${concept.name}`}
            size="default"
            showSettings={true}
          />
        </div>
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
                <PronunciationPlayer
                  text={t.text}
                  pronunciation={t.pronunciation}
                  languageCode={t.languageCode}
                  languageName={t.languageName}
                  size="sm"
                />
              </div>
              <p className={`text-3xl ${scriptClassFor(t.languageCode)}`}>{t.text}</p>
              {t.notes && <p className="text-sm text-muted-foreground">{t.notes}</p>}
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
