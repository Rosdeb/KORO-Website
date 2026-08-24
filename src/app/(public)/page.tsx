"use client";

import Link from "next/link";
import { Compass, BookOpenText, BookmarkPlus, ArrowRight } from "lucide-react";
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

  const languagesToShow = (languages ?? []).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-muted/30">
  <div className="container-koro grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-20">
    {/* Hero Content */}
    <div>
      <div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-primary shadow-sm">
        Koro Language Dictionary
      </div>

     <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-3xl">
     Discover words. Understand languages.
    </h1>

      <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-sm">
        Search and explore language knowledge from communities around the
        world. Discover languages, meanings, categories, and translations —
        all in one place.
      </p>

      <div className="mt-8 max-w-2xl">
        <SearchBar size="lg" />

        <p className="mt-3 text-sm text-muted-foreground">
          Try a language, category, or word such as{" "}
          <span className="font-medium text-foreground">&ldquo;family&rdquo;</span>.
        </p>
      </div>
    </div>

    {/* Quick Links */}
    <div className="lg:border-l lg:border-border lg:pl-12">
      <p className="text-sm font-semibold text-foreground">
        Explore Koro
      </p>

      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Start exploring the dictionary and discover new languages.
      </p>

      <div className="mt-6 divide-y divide-border border-y border-border">
        <QuickLink
          href="/languages"
          title="Browse languages"
          description="Discover all available languages"
        />

        <QuickLink
          href="/dictionary"
          title="Open the dictionary"
          description="Explore words, meanings, and categories"
        />

        <QuickLink
          href="/about"
          title="Learn about Koro"
          description="See how the project works"
        />
      </div>
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

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="group flex items-center justify-between gap-4 py-4">
      <span>
        <span className="block text-sm font-semibold group-hover:text-primary">{title}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
