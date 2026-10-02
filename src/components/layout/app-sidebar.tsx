"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Languages,
  Camera,
  BookMarked,
  MessageSquarePlus,
  Activity,
  Settings,
  ClipboardCheck,
  ArrowLeft,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/features/auth/context";
import { useI18n } from "@/features/i18n/context";

export function AppSidebar() {
  const pathname = usePathname();
  const { isReviewer, isModerator } = useAuth();
  const { t } = useI18n();

  const navItems = [
    { href: "/app", label: t("nav.home"), icon: LayoutGrid, exact: true },
    { href: "/app/translate", label: t("nav.translate"), icon: Languages },
    { href: "/app/scan", label: t("nav.scan"), icon: Camera },
    { href: "/app/books", label: t("nav.books"), icon: BookMarked },
    { href: "/app/submissions", label: t("nav.submissions"), icon: MessageSquarePlus },
    { href: "/app/activity", label: t("nav.activity"), icon: Activity },
    { href: "/app/settings", label: t("nav.settings"), icon: Settings },
  ];

  const items = [
    ...navItems,
    ...(isReviewer ? [{ href: "/app/review", label: t("nav.reviewQueue"), icon: ClipboardCheck, exact: false }] : []),
    ...(isModerator ? [{ href: "/app/messages", label: t("nav.inquiries"), icon: Mail, exact: false }] : []),
  ];

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-border py-6 md:flex">
      <nav className="flex flex-col gap-1 px-3">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-[1.1rem]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-border pt-4 px-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-[1.1rem]" />
          {t("nav.backToWebsite")}
        </Link>
      </div>
    </aside>
  );
}
