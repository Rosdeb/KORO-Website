"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "./contact-form";
import { useI18n } from "@/features/i18n/context";

export default function ContactPage() {
  const { t } = useI18n();

  const topics = [
    {
      title: t("contact.topic1Title"),
      description: t("contact.topic1Desc"),
    },
    {
      title: t("contact.topic2Title"),
      description: t("contact.topic2Desc"),
    },
    {
      title: t("contact.topic3Title"),
      description: t("contact.topic3Desc"),
    },
  ];

  return (
    <div className="container-koro py-10 sm:py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("contact.title")}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {t("contact.subtitle")}
        </p>
      </div>

      <div className="mt-10 grid gap-10 sm:mt-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <section aria-labelledby="message-heading" className="min-w-0">
          <h2 id="message-heading" className="text-xl font-semibold">{t("contact.sendMessage")}</h2>
          <ContactForm />
        </section>

        <section aria-label="What we can help with" className="divide-y divide-border border-y border-border">
          {topics.map(topic => (
            <div key={topic.title} className="py-6">
              <h2 className="text-base font-semibold">{topic.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{topic.description}</p>
            </div>
          ))}
        </section>
      </div>

      <div className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground sm:mt-16">
        {t("contact.moreInfo")}{" "}
        <Link href="/about" className="inline-flex min-h-11 items-center gap-1 rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          {t("contact.aboutKorot")} <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
