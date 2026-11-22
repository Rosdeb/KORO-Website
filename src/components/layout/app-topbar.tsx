"use client";

import Link from "next/link";
import { Globe, LogOut, Settings } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { SearchBar } from "@/components/search/search-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlassSurface } from "@/components/ui/glass";
import { useAuth } from "@/features/auth/context";
import { useI18n } from "@/features/i18n/context";

function AnimatedMesh() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {/* Green accent — left */}
      <div
        className="absolute -left-10 -top-10 size-36 rounded-full opacity-40 blur-2xl"
        style={{
          background: "var(--color-accent, #2d6a4f)",
          animation: "blob 8s ease-in-out infinite",
        }}
      />
      {/* Amber — center-left */}
      <div
        className="absolute left-[20%] -top-8 size-32 rounded-full opacity-30 blur-2xl"
        style={{
          background: "linear-gradient(135deg, #f59e0b, #f97316)",
          animation: "blob-drift 11s ease-in-out infinite reverse",
        }}
      />
      {/* Pink — center */}
      <div
        className="absolute left-[45%] -bottom-8 size-28 rounded-full opacity-25 blur-2xl"
        style={{
          background: "linear-gradient(135deg, #ec4899, #f43f5e)",
          animation: "blob 14s ease-in-out infinite 3s",
        }}
      />
      {/* Indigo — center-right */}
      <div
        className="absolute right-[25%] -top-6 size-32 rounded-full opacity-30 blur-2xl"
        style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          animation: "blob-drift 12s ease-in-out infinite 2s",
        }}
      />
      {/* Cyan — right */}
      <div
        className="absolute right-[10%] -bottom-6 size-28 rounded-full opacity-25 blur-2xl"
        style={{
          background: "linear-gradient(135deg, #06b6d4, #22d3ee)",
          animation: "blob 10s ease-in-out infinite 4s",
        }}
      />
      {/* Teal — far right */}
      <div
        className="absolute -right-8 -top-6 size-32 rounded-full opacity-35 blur-2xl"
        style={{
          background: "linear-gradient(135deg, #10b981, #14b8a6)",
          animation: "blob-drift 9s ease-in-out infinite 1s",
        }}
      />
      {/* Gold shimmer — floating */}
      <div
        className="absolute left-[60%] top-0 size-20 rounded-full opacity-20 blur-xl"
        style={{
          background: "linear-gradient(135deg, #fbbf24, #fcd34d)",
          animation: "blob 7s ease-in-out infinite 5s reverse",
        }}
      />
    </div>
  );
}

export function AppTopbar() {
  const { user, logout } = useAuth();
  const { t } = useI18n();

  return (
    <>
      {/* Spacer */}
      <div className="h-20 shrink-0" />

      <header className="fixed top-3 left-0 right-0 z-30 px-4 sm:px-6">
        <GlassSurface
          tint={0.28}
          blur={22}
          radius={9999}
          className="mx-auto max-w-6xl shadow-lg"
          contentClassName="flex h-14 items-center gap-3 sm:gap-4 px-4"
        >
          <AnimatedMesh />
          <Logo href="/app" />
          <div className="hidden flex-1 items-center md:flex">
            <SearchBar size="md" className="w-full max-w-lg" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 ml-auto md:ml-3 shrink-0">
            {/* Mobile search trigger */}
            <div className="md:hidden">
              <SearchBar size="md" collapsible />
            </div>
            <LanguageToggle />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-2 ring-transparent hover:ring-accent/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="size-8">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback className="text-xs">{user?.name?.slice(0, 1).toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/app/settings">
                    <Settings className="size-4" /> {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Globe className="size-4" /> {t("nav.backToWebsite")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-danger focus:text-danger">
                  <LogOut className="size-4" /> {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </GlassSurface>
      </header>
    </>
  );
}
