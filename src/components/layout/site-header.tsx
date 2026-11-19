"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, Search, X, LayoutGrid, LogOut, Settings, BookMarked, ChevronRight } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { SearchBar } from "@/components/search/search-bar";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils/cn";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const navLinks = [
    { href: "/languages", label: t("nav.languages") },
    { href: "/dictionary", label: t("nav.dictionary") },
    { href: "/leaderboard", label: t("nav.leaderboard") },
    { href: "/about", label: t("nav.about") },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm transition-shadow duration-200",
        scrolled && "shadow-sm",
      )}
    >
      <div className="container-koro flex h-16 items-center gap-4">
        <Logo />

        <nav className="ml-4 hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden flex-1 justify-end px-4 lg:flex">
          <SearchBar size="md" collapsible className="max-w-sm" />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            aria-label="Search"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors lg:hidden"
          >
            <Search className="size-4" />
          </button>

          <LanguageToggle />
          <ThemeToggle />

          {!isLoading && !isAuthenticated && (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("nav.login")}</Link>
              </Button>
              <Button variant="brand" size="sm" asChild>
                <Link href="/register">{t("nav.register")}</Link>
              </Button>
            </div>
          )}

          {!isLoading && isAuthenticated && user && (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="subtle" size="sm" asChild>
                <Link href="/app">
                  <LayoutGrid className="size-3.5" />
                  Dashboard
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-2 ring-transparent hover:ring-accent/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {user.name.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/app">
                      <LayoutGrid className="size-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/books">
                      <BookMarked className="size-4" /> My Books
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/settings">
                      <Settings className="size-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-danger focus:text-danger">
                    <LogOut className="size-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-foreground hover:bg-muted transition-colors md:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-border p-3 lg:hidden animate-slide-up">
          <SearchBar autoFocus onNavigate={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {mounted && mobileOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex h-dvh flex-col bg-background/95 backdrop-blur-xl md:hidden animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
        >
          <div className="container-koro flex h-16 shrink-0 items-center justify-between border-b border-border">
            <Logo />
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-2 hover:bg-muted transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>
          <nav className="container-koro flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-4 py-3 text-base font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                  <ChevronRight className="size-4 opacity-40" />
                </Link>
              );
            })}
            <div className="my-4 h-px shrink-0 bg-border" />
            {!isAuthenticated ? (
              <div className="flex flex-col gap-3 px-1">
                <Button variant="outline" asChild onClick={() => setMobileOpen(false)}>
                  <Link href="/login">{t("nav.login")}</Link>
                </Button>
                <Button variant="brand" asChild onClick={() => setMobileOpen(false)}>
                  <Link href="/register">{t("nav.register")}</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 px-1">
                <Button variant="brand" asChild onClick={() => setMobileOpen(false)}>
                  <Link href="/app">Go to Dashboard</Link>
                </Button>
                <Button variant="ghost" onClick={() => { setMobileOpen(false); logout(); }}>
                  Log out
                </Button>
              </div>
            )}
          </nav>
        </div>,
        document.body,
      )}
    </header>
  );
}
