"use client";

import Link from "next/link";
import { scriptClassFor } from "@/lib/utils/script-font";
import { useI18n } from "@/features/i18n/context";
import type { Concept } from "@/types";

export function ConceptCard({ concept }: { concept: Concept }) {
  const { t } = useI18n();
  const preview = concept.translations.slice(0, 2);
  return (
    <Link href={`/dictionary/${concept.categorySlug}/${concept.id}`} className="group block">
      <div className="h-full rounded-lg border border-border bg-card transition-colors hover:border-accent/40 hover:bg-muted/30">
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold">{concept.name}</p>
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {concept.categorySlug}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {preview.map((tr) => (
              <div key={tr.languageCode} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground shrink-0">{tr.languageName}</span>
                <span className={`font-medium text-foreground text-right ${scriptClassFor(tr.languageCode)}`}>
                  {tr.text}
                </span>
              </div>
            ))}
            {preview.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("card.viewTranslations")}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
