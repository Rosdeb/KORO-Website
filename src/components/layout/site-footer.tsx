"use client";

import Link from "next/link";
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
    <footer className="border-t border-border bg-muted/40 pb-24 md:pb-0">
      <div className="container-koro grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {t("footer.tagline")}
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-3 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-koro border-t border-border py-5 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Korot. {t("footer.rights")}
      </div>
    </footer>
  );
}
