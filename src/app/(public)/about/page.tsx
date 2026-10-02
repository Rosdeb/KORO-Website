"use client";

import Link from "next/link";
import { ArrowRight, Compass, BookOpenText, BookmarkPlus, Globe2, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/features/i18n/context";

export default function AboutPage() {
  const { t, locale } = useI18n();

  const values = [
    {
      icon: Globe2,
      title: t("about.values1Title"),
      description: t("about.values1Desc"),
    },
    {
      icon: Users,
      title: t("about.values2Title"),
      description: t("about.values2Desc"),
    },
    {
      icon: ShieldCheck,
      title: t("about.values3Title"),
      description: t("about.values3Desc"),
    },
  ];

  const steps = [
    {
      icon: Compass,
      title: locale === "bn" ? "অন্বেষণ" : "Explore",
      description: locale === "bn" ? "ভাষা এবং অভিধান ক্যাটাগরি ব্রাউজ করুন। অ্যাকাউন্ট ছাড়াই শুরু করতে পারেন।" : "Browse languages and dictionary categories, or search for a word. You can start without an account.",
      href: "/languages",
      label: locale === "bn" ? "ভাষাসমূহ ব্রাউজ করুন" : "Browse languages",
    },
    {
      icon: BookOpenText,
      title: locale === "bn" ? "শিক্ষা" : "Learn",
      description: locale === "bn" ? "শুদ্ধ অর্থ, অনুবাদ ও উচ্চারণ শুনুন।" : "Discover meanings and translations, with pronunciation and examples where available.",
      href: "/dictionary",
      label: locale === "bn" ? "অভিধান অন্বেষণ করুন" : "Explore the dictionary",
    },
    {
      icon: BookmarkPlus,
      title: locale === "bn" ? "সংরক্ষণ" : "Make it yours",
      description: locale === "bn" ? "ব্যক্তিগত বইয়ে শব্দ সংরক্ষণ করতে একটি অ্যাকাউন্ট খুলুন।" : "Create an account to save words in personal books and return to what you want to learn.",
      href: "/register",
      label: locale === "bn" ? "অ্যাকাউন্ট তৈরি করুন" : "Create an account",
    },
  ];

  return (
    <div>
      <section className="border-b border-border bg-muted/30">
        <div className="container-koro grid gap-8 py-10 sm:gap-10 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("about.eyebrow")}</p>
            <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              {t("about.heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 sm:mt-6 text-muted-foreground">
              {t("about.heroSubtitle")}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Button className="min-h-12 w-full sm:w-auto" asChild>
                <Link href="/dictionary">{t("home.exploreDictionaryBtn")} <ArrowRight aria-hidden="true" className="size-4" /></Link>
              </Button>
              <Button variant="outline" className="min-h-12 w-full sm:w-auto" asChild>
                <Link href="/languages">{t("home.exploreLanguages")}</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 sm:rounded-3xl sm:p-8">
            <Globe2 aria-hidden="true" className="size-8 text-primary" />
            <h2 className="mt-6 text-xl font-semibold">{t("about.cardTitle")}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {t("about.cardDesc")}
            </p>
            <div className="mt-6 border-t border-border pt-5">
              <p className="text-sm font-medium">{t("about.cardFooterTitle")}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("about.cardFooterDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-koro py-10 sm:py-20" aria-labelledby="values-heading">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("about.purposeEyebrow")}</p>
        <h2 id="values-heading" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{t("about.purposeTitle")}</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          {t("about.purposeDesc")}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-5 md:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-primary">
                <value.icon aria-hidden="true" className="size-5" />
              </div>
              <h3 className="mt-5 font-semibold">{value.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/40 py-10 sm:py-20" aria-labelledby="steps-heading">
        <div className="container-koro">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("about.stepsEyebrow")}</p>
          <h2 id="steps-heading" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{t("about.stepsTitle")}</h2>
          <ol className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 md:grid-cols-3 md:gap-10">
            {steps.map((step, index) => (
              <li key={step.title} className="flex flex-col border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <step.icon aria-hidden="true" className="size-6 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-7 text-muted-foreground">{step.description}</p>
                <Link href={step.href} className="mt-3 inline-flex min-h-12 sm:mt-5 items-center gap-2 self-start rounded-sm text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                  {step.label} <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-koro py-10 sm:py-20" aria-labelledby="community-heading">
        <div className="grid gap-6 rounded-2xl border border-border bg-card p-5 sm:gap-8 sm:rounded-3xl sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("about.communityEyebrow")}</p>
            <h2 id="community-heading" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{t("about.communityTitle")}</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              {t("about.communityDesc")}
            </p>
          </div>
          <div className="flex min-w-0 flex-col items-start gap-4 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <h3 className="text-lg font-semibold">{t("about.startOneWord")}</h3>
            <p className="text-sm leading-7 text-muted-foreground">
              {t("about.startOneWordDesc")}
            </p>
            <Button className="min-h-12 w-full sm:w-auto" asChild>
              <Link href="/register">{t("about.joinKorot")} <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
