"use client";

import { useState } from "react";
import { ArrowLeftRight, AlertTriangle, Search, Volume2, X, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { SaveToBookButton } from "@/components/save-to-book/save-to-book-button";
import { useLanguages } from "@/features/languages/hooks";
import { useTranslationSearch } from "@/features/translations/hooks";
import { scriptClassFor } from "@/lib/utils/script-font";
import { TtsSpeechButton } from "@/components/ui/tts-speech-button";
import { PronunciationPlayer } from "@/components/dictionary/pronunciation-player";
import { useI18n } from "@/features/i18n/context";
import { ApiError } from "@/lib/api/client";
import { SearchAnimationLoader } from "@/components/search/search-animation-loader";

export default function TranslatePage() {
  const { t } = useI18n();
  const { data: languages, isLoading: languagesLoading } = useLanguages();
  const [toLanguage, setToLanguage] = useState<string>("");
  const [query, setQuery] = useState("");
  const search = useTranslationSearch();

  const effectiveToLanguage = toLanguage || languages?.[0]?.code || "";
  const targetLanguage = languages?.find((l) => l.code === effectiveToLanguage);
  const sourceLanguage = languages?.find((l) => l.code === "en");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !targetLanguage) return;
    search.mutate({ query: query.trim(), sourceLanguageId: sourceLanguage?.id, targetLanguageId: targetLanguage.id });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("translate.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("translate.subtitle")}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">{t("translate.from")}</label>
              <Select value="en" disabled>
                <SelectTrigger>
                  <SelectValue>{t("common.english")}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("common.english")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="hidden justify-center pb-2.5 sm:flex">
              <ArrowLeftRight className="size-4 text-muted-foreground" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">{t("translate.to")}</label>
              <Select value={effectiveToLanguage} onValueChange={setToLanguage} disabled={languagesLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={t("translate.selectLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  {(languages ?? []).map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("translate.searchPlaceholder")}
              className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-36 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear input"
                onClick={() => setQuery("")}
                className="absolute right-28 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-3.5" />
              </button>
            )}
            <Button type="submit" size="sm" className="absolute right-1.5 top-1.5" loading={search.isPending}>
              {t("translate.searchBtn")}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Sparkles className="size-3 text-accent" />
              Quick search:
            </span>
            {["water", "family", "peace", "mother", "light", "friend"].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setQuery(sample);
                  if (targetLanguage) {
                    search.mutate({
                      query: sample,
                      sourceLanguageId: sourceLanguage?.id,
                      targetLanguageId: targetLanguage.id,
                    });
                  }
                }}
                className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:border-accent/40 hover:bg-accent/10 hover:text-accent transition-all"
              >
                {sample}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {search.isPending && (
        <SearchAnimationLoader
          query={query.trim()}
          sourceLangName="English"
          targetLangName={targetLanguage?.name || "Target Language"}
        />
      )}

      {search.isError && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger/5 px-6 py-10 text-center animate-scale-in">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-danger">
            {search.error instanceof ApiError && search.error.status === 429
              ? "Search Limit Reached"
              : "Search Failed"}
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">{search.error.message}</p>
        </div>
      )}

      {search.isSuccess && search.data.length === 0 && (
        <EmptyState title={t("translate.noMatches")} description={t("translate.noMatchesDesc")} />
      )}

      {search.isSuccess && search.data.length > 0 && (
        <div className="flex flex-col gap-4 animate-slide-up">
          {search.data.map(({ concept, translation }, index) => (
            <Card
              key={concept.id}
              className="border-border/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col gap-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("translate.concept")}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold">{concept.name}</p>
                      <TtsSpeechButton
                        text={concept.name}
                        langCode="en"
                        label={`Listen: ${concept.name}`}
                        size="sm"
                      />
                    </div>
                  </div>
                  <SaveToBookButton
                    concept={{
                      id: concept.id,
                      slug: concept.slug,
                      name: concept.name,
                      categoryId: "",
                      categoryName: "",
                      categorySlug: concept.categorySlug,
                      translations: [translation],
                    }}
                    defaultLanguageId={translation.languageId}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("translate.translation")}</p>
                    <PronunciationPlayer
                      text={translation.text}
                      pronunciation={translation.pronunciation}
                      languageCode={translation.languageCode}
                      size="sm"
                    />
                  </div>
                  <p className={`mt-1 text-2xl text-primary ${scriptClassFor(translation.languageCode)}`}>
                    {translation.text}
                  </p>
                </div>

                {translation.notes && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("translate.notes")}</p>
                    <p className="text-sm text-muted-foreground">{translation.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
