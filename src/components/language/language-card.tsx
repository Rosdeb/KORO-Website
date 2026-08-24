import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { scriptClassFor } from "@/lib/utils/script-font";
import type { Language } from "@/types";

export function LanguageCard({ language }: { language: Language }) {
  return (
    <Link href={`/languages/${language.code}`} className="group block">
      <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-base font-semibold">{language.name}</p>
              <p className={`text-xl leading-tight text-primary ${scriptClassFor(language.code)}`}>
                {language.nativeName}
              </p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {language.code.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{language.region}</p>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {language.conceptCount ?? 0} concepts
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              Explore <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
