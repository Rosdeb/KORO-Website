"use client";

import Link from "next/link";
import { ArrowRight, Compass, BookOpenText, BookmarkPlus, Globe2, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context";
import { useI18n } from "@/features/i18n/context";

export default function AboutPage() {
  const { t, locale } = useI18n();
  const { isAuthenticated } = useAuth();

  const values = [
    { icon: Globe2, title: t("about.values1Title"), description: t("about.values1Desc") },
    { icon: Users, title: t("about.values2Title"), description: t("about.values2Desc") },
    { icon: ShieldCheck, title: t("about.values3Title"), description: t("about.values3Desc") },
  ];

  const steps = [
    {
      icon: Compass,
      title: locale === "bn" ? "অন্বেষণ" : "Explore",
      description:
        locale === "bn"
          ? "ভাষা এবং অভিধান ক্যাটাগরি ব্রাউজ করুন। অ্যাকাউন্ট ছাড়াই শুরু করতে পারেন।"
          : "Browse languages and dictionary categories, or search for a word. No account needed.",
      href: "/languages",
      label: locale === "bn" ? "ভাষাসমূহ ব্রাউজ করুন" : "Browse languages",
    },
    {
      icon: BookOpenText,
      title: locale === "bn" ? "শিক্ষা" : "Learn",
      description:
        locale === "bn"
          ? "শুদ্ধ অর্থ, অনুবাদ ও উচ্চারণ শুনুন।"
          : "Discover meanings and translations, with pronunciation and examples where available.",
      href: "/dictionary",
      label: locale === "bn" ? "অভিধান অন্বেষণ করুন" : "Explore the dictionary",
    },
    {
      icon: BookmarkPlus,
      title: locale === "bn" ? "সংরক্ষণ" : "Make it yours",
      description:
        locale === "bn"
          ? "ব্যক্তিগত বইয়ে শব্দ সংরক্ষণ করতে একটি অ্যাকাউন্ট খুলুন।"
          : "Create an account to save words in personal books and return to what you want to learn.",
      href: isAuthenticated ? "/app/books" : "/register",
      label: isAuthenticated
        ? (locale === "bn" ? "আপনার বইসমূহ দেখুন" : "View your books")
        : (locale === "bn" ? "অ্যাকাউন্ট তৈরি করুন" : "Create an account"),
    },
  ];

  return (
    <div>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
          <span className="script-bn absolute -left-6 top-8 text-7xl text-foreground/5">ক</span>
          <span className="script-mya absolute right-10 top-4 text-8xl text-foreground/5">က</span>
          <span className="script-bn absolute bottom-6 left-1/4 text-6xl text-foreground/5">ভ</span>
          <span className="script-mya absolute bottom-4 right-1/3 text-7xl text-foreground/5">ဂ</span>
        </div>
        <div className="container-koro relative z-10 grid gap-10 py-20 sm:py-28 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("about.eyebrow")}
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {t("about.heroTitle")}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              {t("about.heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="accent" asChild>
                <Link href="/dictionary">
                  {t("home.exploreDictionaryBtn")} <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/languages">{t("home.exploreLanguages")}</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <Globe2 className="size-7 text-accent" />
            <h2 className="mt-5 text-lg font-semibold">{t("about.cardTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t("about.cardDesc")}
            </p>
            <div className="mt-6 border-t border-border pt-5">
              <p className="text-sm font-medium">{t("about.cardFooterTitle")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("about.cardFooterDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="border-b border-border bg-muted/40">
        <div className="container-koro py-14 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {locale === "bn" ? "আমাদের মূল্যবোধ" : "Our values"}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("about.purposeTitle")}
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {values.map((v, i) => (
              <div key={v.title} className="relative rounded-xl border border-border bg-card p-6">
                <span className="absolute right-5 top-5 text-4xl font-black tabular-nums text-muted-foreground/10">
                  0{i + 1}
                </span>
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                  <v.icon className="size-5 text-accent" />
                </div>
                <h3 className="mt-5 font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-b border-border">
        <div className="container-koro py-14 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("about.stepsEyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("about.stepsTitle")}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <step.icon className="size-5 text-muted-foreground" />
                  </div>
                  <span className="text-2xl font-black tabular-nums text-muted-foreground/20">
                    0{i + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <Link
                  href={step.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                >
                  {step.label} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY CTA ── */}
      <section className="container-koro py-14 pb-28 sm:py-20 md:pb-20">
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          <div className="flex flex-col justify-between gap-6 bg-foreground p-8 sm:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-background/40">
                {t("about.communityEyebrow")}
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-background sm:text-3xl">
                {t("about.communityTitle")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-background/55">
                {t("about.communityDesc")}
              </p>
            </div>
            <Button size="lg" className="w-fit bg-background text-foreground hover:bg-muted font-semibold" asChild>
              <Link href={isAuthenticated ? "/app" : "/register"}>
                {isAuthenticated
                  ? (locale === "bn" ? "ড্যাশবোর্ড খুলুন" : "Open Dashboard")
                  : t("about.joinKorot")} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-col justify-between gap-6 bg-card p-8 sm:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {locale === "bn" ? "এখনই শুরু করুন" : "No sign-up needed"}
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                {t("about.startOneWord")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("about.startOneWordDesc")}
              </p>
            </div>
            <Button size="lg" variant="outline" className="w-fit" asChild>
              <Link href="/dictionary">
                {t("home.exploreDictionaryBtn")} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
