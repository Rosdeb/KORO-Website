"use client";

import Link from "next/link";
import { Compass, BookOpenText, BookmarkPlus, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/search-bar";
import { LanguageCard } from "@/components/language/language-card";
import { CategoryCard } from "@/components/dictionary/category-card";
import { ConceptCard } from "@/components/dictionary/concept-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { useLanguages } from "@/features/languages/hooks";
import { useCategories, usePopularConcepts } from "@/features/dictionary/hooks";

const STEPS = [
  {
    icon: Compass,
    title: "Explore",
    description: "Discover language knowledge.",
  },
  {
    icon: BookOpenText,
    title: "Learn",
    description: "Understand translations and pronunciation.",
  },
  {
    icon: BookmarkPlus,
    title: "Save",
    description: "Create your personal language books.",
  },
];

export default function HomePage() {
  const { data: languages, isLoading: languagesLoading } = useLanguages();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: popularConcepts, isLoading: conceptsLoading } = usePopularConcepts();

  const featuredLanguages = (languages ?? []).filter((l) => l.popular).slice(0, 6);
  const languagesToShow = featuredLanguages.length > 0 ? featuredLanguages : (languages ?? []).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary-50 to-background">
        <div className="container-koro flex flex-col items-center gap-6 py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-700">
            <Sparkles className="size-3.5" /> Language discovery, made simple
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Discover. Learn. Preserve.
          </h1>
          <p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Explore languages, discover words, and build your own collection of language knowledge
            with Koro.
          </p>
          <div className="w-full max-w-xl">
            <SearchBar size="lg" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button size="lg" asChild>
              <Link href="/languages">Explore Languages</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dictionary">Explore Dictionary</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Languages */}
      <section className="container-koro py-16 sm:py-20">
        <SectionHeading
          eyebrow="Languages"
          title="Featured languages"
          action={{ href: "/languages", label: "View all" }}
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {languagesLoading &&
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          {!languagesLoading && languagesToShow.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState title="No languages available yet" description="Check back soon." />
            </div>
          )}
          {!languagesLoading && languagesToShow.map((lang) => <LanguageCard key={lang.code} language={lang} />)}
        </div>
      </section>

      {/* Dictionary Categories */}
      <section className="border-y border-border bg-muted/40 py-16 sm:py-20">
        <div className="container-koro">
          <SectionHeading
            eyebrow="Dictionary"
            title="Browse by category"
            action={{ href: "/dictionary", label: "View dictionary" }}
          />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categoriesLoading &&
              Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            {!categoriesLoading && (categories ?? []).length === 0 && (
              <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                <EmptyState title="No categories available yet" description="Check back soon." />
              </div>
            )}
            {!categoriesLoading && (categories ?? []).slice(0, 8).map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Concepts */}
      <section className="container-koro py-16 sm:py-20">
        <SectionHeading eyebrow="Popular" title="Words people are learning" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {conceptsLoading &&
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          {!conceptsLoading && (popularConcepts ?? []).length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState title="No popular concepts yet" description="Start exploring the dictionary." />
            </div>
          )}
          {!conceptsLoading && (popularConcepts ?? []).slice(0, 6).map((concept) => (
            <ConceptCard key={concept.id} concept={concept} />
          ))}
        </div>
      </section>

      {/* How Koro Works */}
      <section className="border-y border-border bg-primary-50/60 py-16 sm:py-20">
        <div className="container-koro">
          <SectionHeading title="How Koro works" center />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center gap-3 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-card shadow-sm">
                  <step.icon className="size-6 text-primary" />
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary-700">
                  <span>{i + 1}</span>
                  <span className="h-1 w-1 rounded-full bg-primary-700" />
                  <span>{step.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="container-koro py-16 sm:py-20">
        <div className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-card p-8 shadow-sm sm:p-12 lg:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">Community</span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Built with communities, for communities</h2>
            <p className="mt-3 text-muted-foreground">
              Koro helps people discover, learn, and preserve indigenous language knowledge —
              one word, one translation, one contribution at a time.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <Stat label="Languages" value={languages?.length} />
            <Stat label="Categories" value={categories?.length} />
            <Stat label="Words" value={popularConcepts?.length} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-koro pb-20">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground">
          <h2 className="text-2xl font-bold sm:text-3xl">Start Exploring</h2>
          <p className="max-w-md text-primary-foreground/85">
            No account needed to browse. Create one only when you&apos;re ready to save words and
            build your own books.
          </p>
          <Button size="lg" variant="accent" asChild>
            <Link href="/dictionary">
              Explore Dictionary <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
  center,
}: {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
  center?: boolean;
}) {
  return (
    <div className={`flex items-end justify-between gap-4 ${center ? "flex-col text-center" : ""}`}>
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>}
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          {action.label} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <p className="text-3xl font-extrabold text-primary">{value ?? "—"}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
