"use client";

import Link from "next/link";
import { scriptClassFor } from "@/lib/utils/script-font";
import { useI18n } from "@/features/i18n/context";
import type { Language } from "@/types";

export function LanguageCard({ language }: { language: Language }) {
  const { t } = useI18n();

  return (
    <Link href={`/languages/${language.code}`} className="group block">
      <div className="h-full rounded-lg border border-border bg-card p-5 transition-colors hover:border-accent/40 hover:bg-muted/30">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-muted-foreground">{language.name}</p>
            <p className={`mt-1 text-2xl font-semibold leading-tight text-foreground ${scriptClassFor(language.code)}`}>
              {language.nativeName}
            </p>
          </div>
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            {language.code.toUpperCase()}
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{language.region}</p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
          <span className="text-muted-foreground">{language.conceptCount ?? 0} {t("card.concepts")}</span>
          <span className="font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
            {t("card.explore")} →
          </span>
        </div>
      </div>
    </Link>
  );
}
