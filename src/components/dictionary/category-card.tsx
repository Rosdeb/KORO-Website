"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/dictionary/category-icon";
import { useI18n } from "@/features/i18n/context";
import type { Category } from "@/types";

export function CategoryCard({ category, basePath = "/dictionary" }: { category: Category; basePath?: string }) {
  const { t } = useI18n();

  return (
    <Link href={`${basePath}/${category.slug}`} className="group block">
      <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent">
            <CategoryIcon slug={category.slug} className="size-5" />
          </div>
          <div className="w-full min-w-0">
            <p className="break-words font-semibold">{category.name}</p>
            {typeof category.conceptCount === "number" && (
              <p className="text-sm text-muted-foreground">{category.conceptCount} {t("card.words")}</p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
