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
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/features/auth/context";

const NAV_ITEMS = [
  { href: "/app", label: "Home", icon: LayoutGrid, exact: true },
  { href: "/app/translate", label: "Translate", icon: Languages },
  { href: "/app/scan", label: "Scan", icon: Camera },
  { href: "/app/books", label: "Books", icon: BookMarked },
  { href: "/app/submissions", label: "Submissions", icon: MessageSquarePlus },
  { href: "/app/activity", label: "Activity", icon: Activity },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

// Shown only to ROLE_LANGUAGE_REVIEWER / ROLE_ADMIN accounts.
const REVIEWER_NAV_ITEM = { href: "/app/review", label: "Review Queue", icon: ClipboardCheck, exact: false };

export function AppSidebar() {
  const pathname = usePathname();
  const { isReviewer } = useAuth();
  const items = isReviewer ? [...NAV_ITEMS, REVIEWER_NAV_ITEM] : NAV_ITEMS;

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
                active ? "bg-primary-50 text-primary-700" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-[1.1rem]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
