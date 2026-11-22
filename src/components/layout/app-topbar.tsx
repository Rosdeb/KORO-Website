"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, LogOut, Search, Settings, X } from "lucide-react";
import { Glass } from "glisse";
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <>
      <div className="h-20 shrink-0" />

      <header className="fixed top-3 left-0 right-0 z-30 px-4 sm:px-6">
        <Glass className="mx-auto flex h-14 max-w-6xl items-center gap-3 rounded-full border border-border/40 px-4 shadow-lg sm:gap-4">
          <Logo href="/app" />
          <div className="hidden min-w-0 flex-1 items-center md:flex">
            <SearchBar size="md" className="w-full max-w-lg" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 ml-auto md:ml-3 shrink-0">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors md:hidden"
            >
              {mobileSearchOpen ? <X className="size-4" /> : <Search className="size-4" />}
            </button>
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
        </Glass>

        {mobileSearchOpen && (
          <div className="mt-2 px-1 md:hidden">
            <div className="rounded-2xl border border-border/50 bg-card/95 p-3 shadow-lg backdrop-blur-xl">
              <SearchBar autoFocus onNavigate={() => setMobileSearchOpen(false)} />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
