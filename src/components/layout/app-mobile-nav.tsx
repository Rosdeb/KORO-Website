"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Search, BookMarked, User, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/features/auth/context";

const ITEMS = [
  { href: "/app", label: "Home", icon: Home, exact: true },
  { href: "/app/translate", label: "Explore", icon: Compass },
  { href: "/search", label: "Search", icon: Search },
  { href: "/app/books", label: "Books", icon: BookMarked },
  { href: "/app/settings", label: "Profile", icon: User },
];

// Shown only to ROLE_LANGUAGE_REVIEWER / ROLE_ADMIN accounts.
const REVIEWER_ITEM = { href: "/app/review", label: "Review", icon: ClipboardCheck, exact: false };

export function AppMobileNav() {
  const pathname = usePathname();
  const { isReviewer } = useAuth();
  const items = isReviewer ? [...ITEMS, REVIEWER_ITEM] : ITEMS;

  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-14 flex-1 select-none flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:bg-muted",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className={cn("size-5 transition-transform", active && "scale-110")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
