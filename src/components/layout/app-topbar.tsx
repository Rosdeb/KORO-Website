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
import { useAuth } from "@/features/auth/context";
import { useI18n } from "@/features/i18n/context";

export function AppTopbar() {
  const { user, logout } = useAuth();
  const { t } = useI18n();

  return (
    <>
      {/* Spacer */}
      <div className="h-20 shrink-0" />

      <header className="fixed top-3 left-0 right-0 z-30 px-4 sm:px-6">
        <div className="mx-auto flex h-13 max-w-6xl items-center gap-4 rounded-2xl border border-border/50 bg-background/80 px-4 shadow-lg backdrop-blur-xl">
          <Logo href="/app" />
          <div className="hidden flex-1 justify-end px-3 md:flex">
            <SearchBar size="md" collapsible className="max-w-md" />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
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
        </div>
      </header>
    </>
  );
}
