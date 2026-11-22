"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Search } from "lucide-react";
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
import { scriptClassFor } from "@/lib/utils/script-font";
import { cn } from "@/lib/utils/cn";

function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" },
    );

    function refresh() {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)")
        .forEach((el) => io.observe(el));
    }

    refresh();
    // Re-observe elements that render after async data loads (language cards, etc.)
    const t1 = setTimeout(refresh, 400);
    const t2 = setTimeout(refresh, 1200);
    // Safety net: if anything is still hidden after 3s, force it visible
    const t3 = setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)")
        .forEach((el) => el.classList.add("is-revealed"));
    }, 3000);

    return () => {
      io.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);
}

const MARQUEE_WORDS = [
  { word: "পানি",      meaning: "Water",   cls: "script-bn"  },
  { word: "ရေ",        meaning: "Water",   cls: "script-mya" },
  { word: "𑄎𑄣𑄴",     meaning: "Water",   cls: "script-ccp" },
  { word: "আলো",      meaning: "Light",   cls: "script-bn"  },
  { word: "မိသားစု",  meaning: "Family",  cls: "script-mya" },
  { word: "ভালোবাসা", meaning: "Love",    cls: "script-bn"  },
  { word: "𑄌𑄋𑄴𑄟𑄳𑄦", meaning: "Sky",    cls: "script-ccp" },
  { word: "မြေ",      meaning: "Earth",   cls: "script-mya" },
  { word: "আকাশ",     meaning: "Sky",     cls: "script-bn"  },
  { word: "ချစ်",     meaning: "Love",    cls: "script-mya" },
];

export default function HomePage() {
  const { t, locale } = useI18n();
  const { data: languages, isLoading: languagesLoading, isError: languagesError, refetch: retryLanguages } = useLanguages();
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError, refetch: retryCategories } = useCategories();
  const { data: popularConcepts, isLoading: conceptsLoading, isError: conceptsError, refetch: retryConcepts } = usePopularConcepts();
  useScrollReveal();

  const languagesToShow = (languages ?? []).slice(0, 6);

  return (
    <div>

      {/* ══════════════════════════════════════════════════
          HERO — light tint, centered, product shot below
      ══════════════════════════════════════════════════ */}
      <section className="relative -mt-16 overflow-hidden bg-accent-50">
        {/* Faint grid backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(28,25,23,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(28,25,23,0.06) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, black 20%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, black 20%, transparent 100%)",
            }}
          />
        </div>

        <div className="container-koro relative z-10 flex flex-col items-center pt-32 pb-20 text-center sm:pt-40 sm:pb-24">
          <Link
            href="/languages"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border bg-card/70 py-1 pl-1 pr-3 shadow-sm text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:border-accent/40 hover:text-foreground"
            style={{ animation: "hero-enter 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s both" }}
          >
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
              {locale === "bn" ? "নতুন" : "New"}
            </span>
            {t("home.badge")}
            <ArrowRight className="size-3" />
          </Link>

          <h1
            className="mt-7 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animation: "hero-enter 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}
          >
            {t("home.heroTitle1")}{" "}
            <br className="hidden sm:block" />
            <span className="text-accent">
              {t("home.heroTitle2")}
            </span>
          </h1>

          <p
            className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animation: "hero-enter 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both" }}
          >
            {t("home.heroSubtitle")}
          </p>

          <div
            className="relative z-20 mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
            style={{ animation: "hero-enter 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s both" }}
          >
            <SearchBar size="lg" className="flex-1" />
            <Button size="lg" variant="accent" className="h-14 shrink-0 rounded-full px-7" asChild>
              <Link href="/dictionary">
                {t("home.exploreDictionaryBtn")} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <Link
            href="/register"
            className="mt-5 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            style={{ animation: "hero-enter 0.7s cubic-bezier(0.16,1,0.3,1) 0.45s both" }}
          >
            {locale === "bn" ? "নতুন? বিনামূল্যে অ্যাকাউন্ট তৈরি করুন" : "New here? Create a free account"}
            <ArrowRight className="size-3.5" />
          </Link>

        </div>

        {/* Stats */}
        <div className="relative z-10 border-t border-border">
          <div className="container-koro grid grid-cols-3 divide-x divide-border py-8 sm:py-10">
            {[
              { value: languages?.length ?? 10, label: locale === "bn" ? "ভাষা নথিভুক্ত" : "Languages documented" },
              { value: categories?.length ?? 20, label: locale === "bn" ? "বিষয় ক্যাটাগরি" : "Word categories" },
              { value: popularConcepts?.length ?? 1000, label: locale === "bn" ? "শব্দ সংরক্ষিত" : "Words preserved" },
            ].map((stat) => (
              <div key={stat.label} className="px-1 text-center sm:px-2">
                <p className="text-2xl font-bold tabular-nums sm:text-5xl">
                  {stat.value}<span className="text-accent">+</span>
                </p>
                <p className="mt-1 text-[10px] leading-tight text-muted-foreground sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          WORD MARQUEE
      ══════════════════════════════════════════════════ */}
      <div className="overflow-hidden border-b border-border bg-muted/20 py-3 select-none">
        <div
          className="flex w-max items-center gap-10"
          style={{ animation: "marquee 35s linear infinite" }}
        >
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i} className="flex shrink-0 items-center gap-3">
              <span className={cn("text-base font-bold text-foreground/50", w.cls)}>{w.word}</span>
              <span className="text-xs font-medium text-muted-foreground/40">{w.meaning}</span>
              <span className="h-3 w-px bg-border/60" />
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          VISUAL SHOWCASE
      ══════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-muted/20 py-16 sm:py-20">
        <div className="container-koro">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

            <div data-reveal>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                {locale === "bn" ? "কীভাবে কাজ করে" : "How it works"}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {locale === "bn" ? "একটি শব্দ, অনেক ভাষা" : "One word,\nacross many languages"}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {locale === "bn"
                  ? "যেকোনো শব্দ খুঁজুন এবং দেখুন কীভাবে সেটি বিভিন্ন ভাষায় উচ্চারিত ও লেখা হয়।"
                  : "Search any word and instantly see how it's written and pronounced across Bengali, Burmese, Chakma and more."}
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { step: "01", label: locale === "bn" ? "যেকোনো শব্দ খুঁজুন"             : "Search any word"          },
                  { step: "02", label: locale === "bn" ? "সব অনুবাদ দেখুন"                : "See all translations"     },
                  { step: "03", label: locale === "bn" ? "সংরক্ষণ করুন বা অবদান রাখুন"   : "Save it or contribute"    },
                ].map(({ step, label }) => (
                  <div key={step} className="flex items-center gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">{step}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" variant="accent" className="mt-8" asChild>
                <Link href="/dictionary">{locale === "bn" ? "এখনই চেষ্টা করুন" : "Try it now"} <ArrowRight className="size-4" /></Link>
              </Button>
            </div>

            <div data-reveal data-delay="2" className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-5 py-3.5">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">water</span>
                  <div className="ml-auto flex size-5 items-center justify-center rounded-full bg-accent">
                    <ArrowRight className="size-3 text-white" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">English</p>
                      <p className="mt-1 text-3xl font-bold">Water</p>
                    </div>
                    <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">Nature</span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      { lang: "Bengali", native: "বাংলা",       word: "পানি",  pronunciation: "pa-ni", cls: "script-bn"  },
                      { lang: "Burmese", native: "မြန်မာ",      word: "ရေ",    pronunciation: "ye",    cls: "script-mya" },
                      { lang: "Chakma",  native: "𑄌𑄋𑄴𑄟𑄳𑄦",   word: "𑄎𑄣𑄴",  pronunciation: "jol",   cls: "script-ccp" },
                    ].map((tr) => (
                      <div key={tr.lang} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{tr.lang}</p>
                          <p className={`mt-0.5 text-xl font-bold ${tr.cls}`}>{tr.word}</p>
                        </div>
                        <span className="shrink-0 rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground">{tr.pronunciation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 hidden rounded-xl border border-border bg-card px-3 py-2 shadow-sm lg:block" style={{ animation: "float-y 4s ease-in-out infinite" }}>
                <p className="text-xs text-muted-foreground">Words documented</p>
                <p className="text-lg font-bold text-accent">{(popularConcepts?.length ?? 0) > 0 ? `${popularConcepts!.length}+` : "1000+"}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          LANGUAGES
      ══════════════════════════════════════════════════ */}
      <section className="container-koro py-16 sm:py-20">
        <div data-reveal>
          <SectionHeading
            eyebrow={t("common.languages")}
            title={t("home.featuredLanguages")}
            action={{ href: "/languages", label: t("home.viewAll") }}
          />
        </div>
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
          {!languagesLoading && languagesToShow.map((lang, i) => (
            <div key={lang.code} data-reveal data-delay={String(Math.min(i + 1, 6))}>
              <LanguageCard language={lang} />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CATEGORIES — pill strip
      ══════════════════════════════════════════════════ */}
      <section className="border-y border-border bg-muted/40 py-12">
        <div className="container-koro">
          <div data-reveal className="mb-6 flex items-center justify-between gap-4">
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
            <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
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
          POPULAR WORDS
      ══════════════════════════════════════════════════ */}
      <section className="container-koro py-16 sm:py-20">
        <div data-reveal>
          <SectionHeading eyebrow={t("home.popularEyebrow")} title={t("home.popularWords")} />
        </div>
        <div className="mt-8">
          {conceptsLoading && (
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-none" />)}
            </div>
          )}
          {conceptsError && <ErrorState title={locale === "bn" ? "শব্দ লোড করা সম্ভব হয়নি।" : "Words couldn't load."} onRetry={() => retryConcepts()} />}
          {!conceptsLoading && !conceptsError && (popularConcepts ?? []).length === 0 && (
            <EmptyState title={t("home.noWords")} description={t("home.startBrowsing")} />
          )}
          {!conceptsLoading && (popularConcepts ?? []).length > 0 && (
            <div className="overflow-hidden rounded-lg border border-border">
              {(popularConcepts ?? []).slice(0, 8).map((concept, i) => (
                <Link
                  key={concept.id}
                  href={`/dictionary/${concept.categorySlug}/${concept.id}`}
                  className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <span className="min-w-0 flex-1 truncate font-semibold sm:w-44 sm:flex-none">{concept.name}</span>
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
          <div data-reveal className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
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
              <Button size="lg" className="w-fit bg-background font-semibold text-foreground hover:bg-muted" asChild>
                <Link href="/dictionary">
                  {t("home.exploreDictionaryBtn")} <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
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
