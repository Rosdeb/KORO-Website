"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Languages,
  MessageSquarePlus,
  BookOpen,
  Search,
  LayoutGrid,
  User,
  Sparkles,
  ScanLine,
  BookMarked,
  FileText,
  Activity,
  ClipboardCheck,
  ChevronRight,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { cn } from "@/lib/utils/cn";
import { Dialog, DialogTrigger, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, isReviewer, user } = useAuth();

  const items = [
    { href: "/", label: "Home", icon: Home, exact: true },
    { href: "/languages", label: "Languages", icon: Languages, exact: false },
    { href: "/app/submissions/new", label: "Suggest", icon: MessageSquarePlus, exact: true },
    { href: "/dictionary", label: "Dictionary", icon: BookOpen, exact: false },
    { href: "/search", label: "Search", icon: Search, exact: false },
  ];

  const moreItems = [
    isAuthenticated
      ? { href: "/app/settings", label: "Profile & Settings", icon: User, description: "Manage account & preferences" }
      : { href: "/login", label: "Sign In / Register", icon: LogIn, description: "Access your books and account" },
    { href: "/app/translate", label: "Translate", icon: Sparkles, description: "Instant concept translations" },
    { href: "/app/books", label: "My Books", icon: BookMarked, description: "Your custom vocabulary collections" },
    { href: "/app/scan", label: "Scan Object", icon: ScanLine, description: "Visual object recognition" },
    { href: "/app/submissions", label: "Submissions", icon: FileText, description: "Suggest & track new words" },
    { href: "/app/activity", label: "Activity History", icon: Activity, description: "Your learning log" },
  ];

  if (isReviewer) {
    moreItems.push({ href: "/app/review", label: "Review Queue", icon: ClipboardCheck, description: "Review community translations" });
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const isMoreActive = moreItems.some((item) => isActive(item.href));

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {items.map((item) => {
        const active = isActive(item.href, item.exact);
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
      <Dialog>
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
            <span className="truncate max-w-full text-center">More</span>
          </button>
        </DialogTrigger>

        <DialogContent className="inset-x-0 bottom-0 top-auto max-h-[85dvh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto overscroll-contain rounded-b-none rounded-t-3xl border-x-0 border-b-0 p-0 pb-[env(safe-area-inset-bottom)] animate-none">
          <div className="mx-auto w-full max-w-md px-5 pb-6 pt-3">
            {/* Sheet Handle */}
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />

            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <div>
                <DialogTitle className="text-base font-semibold">
                  {isAuthenticated ? user?.name || "Account Menu" : "Menu & Explore"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {isAuthenticated ? user?.email || "Signed in" : "Korot Dictionary Platform"}
                </p>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                All Features
              </span>
              {moreItems.map((mi) => {
                const Icon = mi.icon;
                const active = isActive(mi.href);
                return (
                  <DialogClose asChild key={mi.href}>
                    <Link
                      href={mi.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3.5 rounded-xl px-3 py-2.5 transition-colors active:bg-muted",
                        active ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground",
                      )}
                    >
                      <div className={cn("flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground", active && "bg-primary text-primary-foreground")}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="text-sm">{mi.label}</span>
                        {mi.description && (
                          <span className="text-xs text-muted-foreground font-normal">{mi.description}</span>
                        )}
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground/60" />
                    </Link>
                  </DialogClose>
                );
              })}
            </nav>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
