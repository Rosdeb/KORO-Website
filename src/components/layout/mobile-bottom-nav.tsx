"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Languages,
  BookOpen,
  Search,
  User,
  Menu,
  Sparkles,
  ScanLine,
  BookMarked,
  FileText,
  Activity,
  Settings,
  ClipboardCheck,
} from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { cn } from "@/lib/utils/cn";
import { Dialog, DialogTrigger, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, isReviewer } = useAuth();

  const items = [
    { href: "/", label: "Home", icon: Home, exact: true },
    { href: "/languages", label: "Languages", icon: Languages },
    { href: "/dictionary", label: "Dictionary", icon: BookOpen },
    { href: "/search", label: "Search", icon: Search },
    isAuthenticated
      ? { href: "/app", label: "Profile", icon: User }
      : { href: "/login", label: "Login", icon: User },
  ];

  const moreItems = [
    { href: "/app/translate", label: "Translate", icon: Sparkles },
    { href: "/app/scan", label: "Scan", icon: ScanLine },
    { href: "/app/books", label: "Books", icon: BookMarked },
    { href: "/app/submissions", label: "Submissions", icon: FileText },
    { href: "/app/activity", label: "Activity", icon: Activity },
    { href: "/app/settings", label: "Settings", icon: Settings },
  ];

  if (isReviewer) {
    moreItems.push({ href: "/app/review", label: "Review Queue", icon: ClipboardCheck });
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

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
              "flex min-h-14 select-none flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:bg-muted",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className={cn("size-5 transition-transform", active && "scale-110")} />
            {item.label}
          </Link>
        );
      })}

      {/* More menu opens a bottom sheet with the full app nav for easy access */}
      <Dialog>
        <DialogTrigger asChild>
          <button
            aria-label="More menu"
            className="flex min-h-14 select-none flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors active:bg-muted"
          >
            <Menu className="size-5" />
            More
          </button>
        </DialogTrigger>
        <DialogContent className="inset-x-0 bottom-0 left-0 top-auto max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-2xl border-x-0 border-b-0 p-0 pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto w-full max-w-md p-4">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" />
            <DialogTitle className="px-1.5 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              More
            </DialogTitle>
            <nav className="flex flex-col gap-1">
              {moreItems.map((mi) => {
                const Icon = mi.icon;
                const active = isActive(mi.href);
                return (
                  <DialogClose asChild key={mi.href}>
                    <Link
                      href={mi.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors active:bg-muted",
                        active ? "bg-muted text-primary" : "text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      <span className="grow">{mi.label}</span>
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
