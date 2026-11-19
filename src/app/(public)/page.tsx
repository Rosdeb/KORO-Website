"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/search-bar";
import { LanguageCard } from "@/components/language/language-card";
import { CategoryIcon } from "@/components/dictionary/category-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { useLanguages } from "@/features/languages/hooks";
import { useCategories, usePopularConcepts } from "@/features/dictionary/hooks";
import { useI18n } from "@/features/i18n/context";
import { ScriptRain } from "@/components/home/script-rain";
import { scriptClassFor } from "@/lib/utils/script-font";

export default function HomePage() {
  const { t, locale } = useI18n();
  const { data: languages, isLoading: languagesLoading, isError: languagesError, refetch: retryLanguages } = useLanguages();
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError, refetch: retryCategories } = useCategories();
  const { data: popularConcepts, isLoading: conceptsLoading, isError: conceptsError, refetch: retryConcepts } = usePopularConcepts();

  const languagesToShow = (languages ?? []).slice(0, 6);

  return (
    <div>

      {/* ══════════════════════════════════════════════════
          HERO — light, full viewport
      ══════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden border-b border-border bg-background">
        <ScriptRain />

        <div className="container-koro relative z-10 flex flex-col items-center py-20 text-center">

          {/* Badge */}
          <div className="inline-block rounded border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
            {t("home.badge")}
          </div>

          {/* Headline */}
          <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {t("home.heroTitle1")}
            <br />
            <span className="text-accent">{t("home.heroTitle2")}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("home.heroSubtitle")}
          </p>

          {/* Search */}
          <div className="mt-10 w-full max-w-xl">
            <SearchBar size="lg" />
            <p className="mt-3 text-sm text-muted-foreground">
              {locale === "bn"
                ? <>"পানি" বা "family" দিয়ে অনুসন্ধান করুন</>
                : <>Try <span className="font-medium text-foreground">"family"</span> or <span className="font-medium text-foreground">"water"</span></>
              }
            </p>
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="accent" asChild>
              <Link href="/dictionary">
                {t("home.exploreDictionaryBtn")} <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">
                {locale === "bn" ? "অ্যাকাউন্ট তৈরি করুন" : "Sign up for free"}
              </Link>
            </Button>
          </div>

          {/* Script samples */}
          <div className="mt-14 flex items-center gap-5 select-none">
            <span className="script-bn text-xl text-foreground/20">বাংলা</span>
            <span className="text-muted-foreground/30 text-sm">·</span>
            <span className="script-mya text-xl text-foreground/20">မြန်မာ</span>
            <span className="text-muted-foreground/30 text-sm">·</span>
            <span className="script-ccp text-xl text-foreground/20">𑄌𑄋𑄴𑄟𑄳𑄦</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="size-5 animate-bounce text-muted-foreground/30" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════ */}
      <div className="border-b border-border">
        <div className="container-koro py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1.5 text-sm text-muted-foreground">
            {languages?.length != null && (
              <span><strong className="font-bold text-foreground">{languages.length}</strong>{locale === "bn" ? " ভাষা" : " languages"}</span>
            )}
            {categories?.length != null && (
              <><span className="text-border">·</span><span><strong className="font-bold text-foreground">{categories.length}</strong>{locale === "bn" ? " ক্যাটাগরি" : " categories"}</span></>
            )}
            {popularConcepts?.length != null && (
              <><span className="text-border">·</span><span><strong className="font-bold text-foreground">{popularConcepts.length}+</strong>{locale === "bn" ? " শব্দ নথিভুক্ত" : " words documented"}</span></>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          LANGUAGES
      ══════════════════════════════════════════════════ */}
      <section className="container-koro py-16 sm:py-20">
        <SectionHeading
          eyebrow={t("common.languages")}
          title={t("home.featuredLanguages")}
          action={{ href: "/languages", label: t("home.viewAll") }}
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {languagesLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
          {languagesError && (
            <div className="sm:col-span-2 lg:col-span-3">
              <ErrorState title={locale === "bn" ? "ভাষা লোড করা সম্ভব হয়নি।" : "Languages couldn't load."} onRetry={() => retryLanguages()} />
            </div>
          )}
          {!languagesLoading && !languagesError && languagesToShow.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState title={t("home.noLanguages")} description={t("home.checkBack")} />
            </div>
          )}
          {!languagesLoading && languagesToShow.map((lang) => <LanguageCard key={lang.code} language={lang} />)}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CATEGORIES — pill strip
      ══════════════════════════════════════════════════ */}
      <section className="border-y border-border bg-muted/40 py-12">
        <div className="container-koro">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("common.dictionary")}</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">{t("home.browseByCategory")}</h2>
            </div>
            <Link href="/dictionary" className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("home.viewDictionary")} <ArrowRight className="inline size-3.5" />
            </Link>
          </div>

          {categoriesLoading && (
            <div className="flex gap-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-md" />)}
            </div>
          )}
          {categoriesError && <ErrorState title={locale === "bn" ? "ক্যাটাগরি লোড করা সম্ভব হয়নি।" : "Categories couldn't load."} onRetry={() => retryCategories()} />}
          {!categoriesLoading && !categoriesError && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap">
              {(categories ?? []).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/dictionary/${cat.slug}`}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-background px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:bg-muted/30 hover:text-foreground"
                >
                  <CategoryIcon slug={cat.slug} className="size-3.5 shrink-0 transition-colors group-hover:text-accent" />
                  {cat.name}
                  {typeof cat.conceptCount === "number" && (
                    <span className="text-xs text-muted-foreground/50">{cat.conceptCount}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          POPULAR WORDS — dictionary list
      ══════════════════════════════════════════════════ */}
      <section className="container-koro py-16 sm:py-20">
        <SectionHeading eyebrow={t("home.popularEyebrow")} title={t("home.popularWords")} />

        <div className="mt-8">
          {conceptsLoading && (
            <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-none" />)}
            </div>
          )}
          {conceptsError && <ErrorState title={locale === "bn" ? "শব্দ লোড করা সম্ভব হয়নি।" : "Words couldn't load."} onRetry={() => retryConcepts()} />}
          {!conceptsLoading && !conceptsError && (popularConcepts ?? []).length === 0 && (
            <EmptyState title={t("home.noWords")} description={t("home.startBrowsing")} />
          )}
          {!conceptsLoading && (popularConcepts ?? []).length > 0 && (
            <div className="rounded-lg border border-border overflow-hidden">
              {(popularConcepts ?? []).slice(0, 8).map((concept, i) => (
                <Link
                  key={concept.id}
                  href={`/dictionary/${concept.categorySlug}/${concept.id}`}
                  className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <span className="w-36 shrink-0 font-semibold sm:w-44">{concept.name}</span>
                  <span className="hidden shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground sm:inline">
                    {concept.categorySlug}
                  </span>
                  <div className="hidden flex-1 items-center gap-6 md:flex">
                    {concept.translations.slice(0, 3).map((tr) => (
                      <span key={tr.languageCode} className="flex flex-col">
                        <span className="text-xs text-muted-foreground">{tr.languageName}</span>
                        <span className={`text-sm font-semibold ${scriptClassFor(tr.languageCode)}`}>{tr.text}</span>
                      </span>
                    ))}
                  </div>
                  <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA — split card
      ══════════════════════════════════════════════════ */}
      <section className="border-t border-border py-16 pb-28 md:pb-16">
        <div className="container-koro">
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">

            {/* Left — browse now */}
            <div className="flex flex-col justify-between gap-6 bg-foreground p-8 sm:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-background/40">
                  {locale === "bn" ? "এখনই শুরু করুন" : "No sign-up needed"}
                </p>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-background sm:text-3xl">
                  {locale === "bn" ? "এখনই অন্বেষণ করুন" : "Start exploring\ntoday"}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-background/50">
                  {locale === "bn"
                    ? "শব্দ খুঁজুন, ভাষা আবিষ্কার করুন — কোনো অ্যাকাউন্ট ছাড়াই।"
                    : "Browse words across languages freely. No account, no barrier."}
                </p>
              </div>
              <Button size="lg" className="w-fit bg-background text-foreground hover:bg-muted font-semibold" asChild>
                <Link href="/dictionary">
                  {t("home.exploreDictionaryBtn")} <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            {/* Right — create account */}
            <div className="flex flex-col justify-between gap-6 bg-card p-8 sm:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {locale === "bn" ? "আরও বেশি করুন" : "Save your progress"}
                </p>
                <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                  {locale === "bn" ? "নিজের সংগ্রহ গড়ুন" : "Build your own\nword collection"}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {locale === "bn"
                    ? "পছন্দের শব্দ সংরক্ষণ করুন, নিজস্ব বই তৈরি করুন।"
                    : "Save words, build vocabulary books, and track your learning — when you're ready."}
                </p>
              </div>
              <Button size="lg" variant="brand" className="w-fit" asChild>
                <Link href="/register">
                  {locale === "bn" ? "বিনামূল্যে যোগ দিন" : "Create free account"} <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
        )}
        <h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          {action.label} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
