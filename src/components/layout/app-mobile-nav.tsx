"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Search, BookMarked, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: "/app", label: "Home", icon: Home, exact: true },
  { href: "/app/translate", label: "Explore", icon: Compass },
  { href: "/search", label: "Search", icon: Search },
  { href: "/app/books", label: "Books", icon: BookMarked },
  { href: "/app/settings", label: "Profile", icon: User },
];

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card/95 backdrop-blur-md md:hidden">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
