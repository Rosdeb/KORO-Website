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
  Users,
  ChevronRight,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/features/auth/context";
import { useI18n } from "@/features/i18n/context";
import { canViewAdminLeaderboard } from "@/features/leaderboard/api";
import { Dialog, DialogTrigger, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { LanguageToggle } from "@/components/layout/language-toggle";

export function AppMobileNav() {
  const pathname = usePathname();
  const { isReviewer, isModerator, user } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const primaryItems = [
    { href: "/app", label: t("nav.home"), icon: Home, exact: true },
    { href: "/app/translate", label: t("nav.translate"), icon: Languages, exact: false },
    { href: "/app/submissions/new", label: t("nav.suggest"), icon: MessageSquarePlus, exact: true },
    { href: "/search", label: t("nav.search"), icon: Search, exact: false },
    { href: "/app/books", label: t("nav.books"), icon: BookMarked, exact: false },
  ];

  const moreItems = [
    { href: "/app/settings", label: t("nav.profileSettings"), icon: User, description: "Account, preferences & security" },
    { href: "/app/submissions", label: t("nav.submissions"), icon: FileText, description: "Track your suggested translations" },
    { href: "/app/scan", label: t("nav.scan"), icon: Camera, description: "Visual dictionary lookup" },
    { href: "/app/activity", label: t("nav.activity"), icon: Activity, description: "Your translations & saved words" },
  ];

  const adminItems = [
    ...(isReviewer ? [{ href: "/app/review", label: t("nav.reviewQueue"), icon: ClipboardCheck, badge: "Reviewer" }] : []),
    ...(isModerator ? [{ href: "/app/messages", label: t("nav.inquiries"), icon: Mail, badge: "Support" }] : []),
    ...(canViewAdminLeaderboard(user?.roles)
      ? [{ href: "/app/leaderboard", label: t("nav.leaderboard"), icon: Users, badge: "Admin" }]
      : []),
  ];

  const isMoreActive =
    moreItems.some((item) => pathname === item.href || pathname.startsWith(item.href + "/")) ||
    adminItems.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <nav
      aria-label="App Primary Navigation"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {primaryItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-14 select-none flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] sm:text-[11px] font-medium transition-colors active:bg-muted",
              active ? "text-primary font-semibold" : "text-muted-foreground",
            )}
          >
            <Icon className={cn("size-4.5 sm:size-5 transition-transform", active && "scale-110")} />
            <span className="truncate max-w-full text-center">{item.label}</span>
          </Link>
        );
      })}

      {/* 6th Tab: More (Dashboard Grid Icon) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="More navigation options"
            className={cn(
              "flex min-h-14 select-none flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] sm:text-[11px] font-medium transition-colors active:bg-muted",
              isMoreActive ? "text-primary font-semibold" : "text-muted-foreground",
            )}
          >
            <LayoutGrid className={cn("size-4.5 sm:size-5 transition-transform", isMoreActive && "scale-110")} />
            <span className="truncate max-w-full text-center">{t("nav.more")}</span>
          </button>
        </DialogTrigger>

        <DialogContent className="inset-x-0 bottom-0 top-auto max-h-[85dvh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto overscroll-contain rounded-b-none rounded-t-3xl border-x-0 border-b-0 p-0 pb-[env(safe-area-inset-bottom)] animate-none">
          <div className="mx-auto w-full max-w-md px-5 pb-6 pt-3">
            {/* Sheet Handle */}
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />

            {/* User Mini Profile Header + Language Toggle */}
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <div>
                <DialogTitle className="text-base font-semibold">
                  {user?.name || "Account Menu"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">{user?.email || "Korot Learning Space"}</p>
              </div>
              <LanguageToggle />
            </div>

            {/* Primary More Links */}
            <div className="flex flex-col gap-1">
              <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Features & Tools
              </span>
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
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

            {/* Admin / Moderator / Reviewer Section (if any) */}
            {adminItems.length > 0 && (
              <div className="mt-4 flex flex-col gap-1 border-t border-border pt-3">
                <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Management & Review
                </span>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
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

            {/* Back to Public Website */}
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
    </nav>
  );
}
