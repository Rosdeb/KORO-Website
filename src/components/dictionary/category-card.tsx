"use client";

import Link from "next/link";
import { CategoryIcon } from "@/components/dictionary/category-icon";
import { useI18n } from "@/features/i18n/context";
import type { Category } from "@/types";

export function CategoryCard({ category, basePath = "/dictionary" }: { category: Category; basePath?: string }) {
  const { t } = useI18n();

  return (
    <Link href={`${basePath}/${category.slug}`} className="group block">
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card p-5 text-center transition-colors hover:border-accent/40 hover:bg-muted/30">
        <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
          <CategoryIcon slug={category.slug} className="size-5" />
        </div>
        <div>
          <p className="break-words text-sm font-semibold">{category.name}</p>
          {typeof category.conceptCount === "number" && (
            <p className="mt-0.5 text-xs text-muted-foreground">{category.conceptCount} {t("card.words")}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
