"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { useI18n } from "@/features/i18n/context";

export function SiteFooter() {
  const { t, locale } = useI18n();

  const columns = [
    {
      title: t("footer.explore"),
      links: [
        { href: "/languages", label: t("nav.languages") },
        { href: "/dictionary", label: t("nav.dictionary") },
        { href: "/search", label: t("nav.search") },
        { href: "/leaderboard", label: t("nav.leaderboard") },
      ],
    },
    {
      title: t("footer.korot"),
      links: [
        { href: "/about", label: t("footer.about") },
        { href: "/contact", label: t("footer.contact") },
        { href: "/register", label: t("footer.createAccount") },
        { href: "/login", label: t("footer.login") },
      ],
    },
  ];

  return (
    <footer className="border-t border-border pb-24 md:pb-0">
      <div className="container-koro py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-16">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              {locale === "bn"
                ? "আদিবাসী ভাষা সংরক্ষণে নিবেদিত"
                : "Dedicated to preserving indigenous languages"}
            </p>
          </div>
          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                {col.title}
              </h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3 opacity-0 -translate-y-0.5 translate-x-0.5 transition-all group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="container-koro border-t border-border py-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Korot. {t("footer.rights")}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {locale === "bn" ? "ভাষাগত বৈচিত্র্য রক্ষায় নিবেদিত" : "Dedicated to linguistic diversity"}
          </p>
        </div>
      </div>
    </footer>
  );
}
