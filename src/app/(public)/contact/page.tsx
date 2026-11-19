"use client";

import Link from "next/link";
import { Mail, HelpCircle, MessageSquare, Users, ArrowRight } from "lucide-react";
import { ContactForm } from "./contact-form";
import { useI18n } from "@/features/i18n/context";

const TOPIC_ICONS = [HelpCircle, MessageSquare, Users];

export default function ContactPage() {
  const { t } = useI18n();

  const topics = [
    { title: t("contact.topic1Title"), description: t("contact.topic1Desc") },
    { title: t("contact.topic2Title"), description: t("contact.topic2Desc") },
    { title: t("contact.topic3Title"), description: t("contact.topic3Desc") },
  ];

  return (
    <div className="container-koro py-10 pb-28 sm:py-16 md:pb-16">

      {/* Header */}
      <div className="mb-10 max-w-xl">
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-accent" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</p>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{t("contact.title")}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{t("contact.subtitle")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-14">

        {/* Form */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">{t("contact.sendMessage")}</h2>
          </div>
          <div className="p-5">
            <ContactForm />
          </div>
        </div>

        {/* Topics */}
        <div className="flex flex-col gap-4">
          {topics.map((topic, i) => {
            const Icon = TOPIC_ICONS[i];
            return (
              <div key={topic.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{topic.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{topic.description}</p>
                </div>
              </div>
            );
          })}

          <div className="mt-2 rounded-xl border border-border bg-muted/40 p-5">
            <p className="text-xs text-muted-foreground">{t("contact.moreInfo")}</p>
            <Link
              href="/about"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              {t("contact.aboutKorot")} <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
