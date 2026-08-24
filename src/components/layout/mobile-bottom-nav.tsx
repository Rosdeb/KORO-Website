"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Languages, BookOpen, Search, User } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { cn } from "@/lib/utils/cn";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/languages", label: "Languages", icon: Languages },
    { href: "/dictionary", label: "Dictionary", icon: BookOpen },
    { href: "/search", label: "Search", icon: Search },
    isAuthenticated
      ? { href: "/app", label: "Profile", icon: User }
      : { href: "/login", label: "Login", icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card/95 backdrop-blur-md md:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
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
