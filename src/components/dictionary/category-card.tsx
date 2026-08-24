import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/dictionary/category-icon";
import type { Category } from "@/types";

export function CategoryCard({ category, basePath = "/dictionary" }: { category: Category; basePath?: string }) {
  return (
    <Link href={`${basePath}/${category.slug}`} className="group block">
      <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="flex flex-col items-start gap-3 p-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-accent-50 text-accent">
            <CategoryIcon slug={category.slug} className="size-5" />
          </div>
          <div>
            <p className="font-semibold">{category.name}</p>
            {typeof category.conceptCount === "number" && (
              <p className="text-sm text-muted-foreground">{category.conceptCount} words</p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
