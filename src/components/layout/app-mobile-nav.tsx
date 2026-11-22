"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Languages,
  MessageSquarePlus,
  Search,
  BookMarked,
  LayoutGrid,
  User,
  FileText,
  Camera,
  Activity,
  ClipboardCheck,
  Mail,
  ChevronRight,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/features/auth/context";
import { useI18n } from "@/features/i18n/context";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { LanguageToggle } from "@/components/layout/language-toggle";

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
  action?: () => void;
}

export function AppMobileNav() {
  const pathname = usePathname();
  const { isReviewer, isModerator, user } = useAuth();
  const { t } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(href + "/");

  const tabs: Tab[] = [
    { href: "/app", label: t("nav.home"), icon: Home },
    { href: "/app/translate", label: t("nav.translate"), icon: Languages },
    { href: "/app/submissions/new", label: t("nav.suggest"), icon: MessageSquarePlus },
    { href: "/app/books", label: t("nav.books"), icon: BookMarked },
    { href: "/__more__", label: t("nav.more"), icon: LayoutGrid, action: () => setMoreOpen(true) },
  ];

  const moreItems = [
    { href: "/search", label: t("nav.search"), icon: Search, description: "Search words & categories" },
    { href: "/app/settings", label: t("nav.profileSettings"), icon: User, description: "Account, preferences & security" },
    { href: "/app/submissions", label: t("nav.submissions"), icon: FileText, description: "Track your suggested translations" },
    { href: "/app/scan", label: t("nav.scan"), icon: Camera, description: "Visual dictionary lookup" },
    { href: "/app/activity", label: t("nav.activity"), icon: Activity, description: "Your translations & saved words" },
  ];

  const adminItems = [
    ...(isReviewer ? [{ href: "/app/review", label: t("nav.reviewQueue"), icon: ClipboardCheck, badge: "Reviewer" }] : []),
    ...(isModerator ? [{ href: "/app/messages", label: t("nav.inquiries"), icon: Mail, badge: "Support" }] : []),
  ];

  const isMoreActive =
    moreItems.some((item) => isActive(item.href)) ||
    adminItems.some((item) => isActive(item.href));

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <nav
        className="mx-3 mb-2 flex items-stretch rounded-2xl border border-white/[0.08] bg-[rgb(30_30_30_/_0.88)] backdrop-blur-2xl backdrop-saturate-150"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
        aria-label="App navigation"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.href === "/__more__" ? isMoreActive : isActive(tab.href);
          const isMore = tab.href === "/__more__";

          const content = (
            <span
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors",
                active ? "text-[var(--accent,#2a835f)]" : "text-white/50",
              )}
            >
              <Icon className="size-6" strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium leading-tight truncate max-w-full">{tab.label}</span>
            </span>
          );

          if (isMore) {
            return (
              <button
                key={tab.href}
                type="button"
                onClick={tab.action}
                className="flex flex-1 cursor-pointer border-0 bg-transparent p-0"
                aria-label={tab.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1"
              aria-current={active ? "page" : undefined}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="inset-x-0 bottom-0 top-auto max-h-[85dvh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto overscroll-contain rounded-b-none rounded-t-3xl border-x-0 border-b-0 p-0 pb-[env(safe-area-inset-bottom)] animate-none">
          <div className="mx-auto w-full max-w-md px-5 pb-6 pt-3">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3 pr-10">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base font-semibold truncate">
                  {user?.name || "Account Menu"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground truncate">{user?.email || "Korot Learning Space"}</p>
              </div>
              <div className="shrink-0 mr-2">
                <LanguageToggle />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("nav.featuresTools")}
              </span>
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <DialogClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3.5 rounded-xl px-3 py-2.5 transition-colors active:bg-muted",
                        active ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground",
                      )}
                    >
                      <div className={cn("flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground", active && "bg-primary text-primary-foreground")}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="text-sm">{item.label}</span>
                        <span className="text-xs text-muted-foreground font-normal">{item.description}</span>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground/60" />
                    </Link>
                  </DialogClose>
                );
              })}
            </div>

            {adminItems.length > 0 && (
              <div className="mt-4 flex flex-col gap-1 border-t border-border pt-3">
                <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("nav.managementReview")}
                </span>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <DialogClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3.5 rounded-xl px-3 py-2.5 transition-colors active:bg-muted",
                          active ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground",
                        )}
                      >
                        <div className={cn("flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary", active && "bg-primary text-primary-foreground")}>
                          <Icon className="size-4" />
                        </div>
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {item.badge}
                        </span>
                        <ChevronRight className="size-4 text-muted-foreground/60" />
                      </Link>
                    </DialogClose>
                  );
                })}
              </div>
            )}

            <div className="mt-4 border-t border-border pt-3">
              <DialogClose asChild>
                <Link
                  href="/"
                  className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Globe className="size-4" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{t("nav.backToWebsite")}</span>
                  <ChevronRight className="size-4 text-muted-foreground/60" />
                </Link>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
