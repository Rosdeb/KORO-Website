import Link from "next/link";
import { Card } from "@/components/ui/card";
import { scriptClassFor } from "@/lib/utils/script-font";
import type { Concept } from "@/types";

export function ConceptCard({ concept }: { concept: Concept }) {
  const preview = concept.translations.slice(0, 2);
  return (
    <Link href={`/dictionary/${concept.categorySlug}/${concept.slug}`} className="group block">
      <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="flex flex-col gap-3 p-5">
          <p className="font-semibold">{concept.name}</p>
          <div className="flex flex-col gap-1.5">
            {preview.map((t) => (
              <div key={t.languageCode} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.languageName}</span>
                <span className={scriptClassFor(t.languageCode)}>{t.text}</span>
              </div>
            ))}
            {preview.length === 0 && <p className="text-sm text-muted-foreground">View translations</p>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
