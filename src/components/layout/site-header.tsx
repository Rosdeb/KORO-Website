"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, Search, X, LayoutGrid, LogOut, Settings, BookMarked, ChevronRight } from "lucide-react";
import { Glass } from "glisse";
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
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const showHeaderSearch = pathname !== "/" || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/languages", label: t("nav.languages") },
    { href: "/dictionary", label: t("nav.dictionary") },
    { href: "/leaderboard", label: t("nav.leaderboard") },
    { href: "/about", label: t("nav.about") },
  ];

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

  const headerContent = (
    <>
      <Logo />

      <nav className="ml-2 hidden items-center gap-0.5 lg:flex">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
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

      <div className="ml-2 min-w-0 flex-1">
        {showHeaderSearch && (
          <SearchBar size="md" className="w-full lg:ml-auto lg:w-56 xl:w-72" />
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="hidden items-center gap-2 sm:flex">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {!isLoading && !isAuthenticated && (
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" asChild className="hidden whitespace-nowrap sm:inline-flex">
              <Link href="/login">{t("nav.login")}</Link>
            </Button>
            <Button
              variant="brand"
              size="sm"
              asChild
              className="h-8 whitespace-nowrap px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
            >
              <Link href="/register">{t("nav.register")}</Link>
            </Button>
          </div>
        )}

        {!isLoading && isAuthenticated && user && (
          <div className="hidden items-center gap-1.5 sm:flex">
            <Button variant="subtle" size="sm" asChild>
              <Link href="/app" className="whitespace-nowrap">
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
                  <Link href="/app"><LayoutGrid className="size-4" /> Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/books"><BookMarked className="size-4" /> My Books</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/settings"><Settings className="size-4" /> Settings</Link>
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
          className="rounded-lg p-1.5 text-foreground hover:bg-muted/60 transition-colors lg:hidden"
        >
          <Menu className="size-5" />
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="h-16 shrink-0" />

      <header
        className={cn(
          "fixed inset-x-0 z-30 transition-all duration-300 ease-out",
          scrolled ? "top-3 px-4 sm:px-6" : "top-0",
        )}
      >
        {scrolled ? (
          <Glass className="mx-auto flex h-14 max-w-5xl items-center gap-3 rounded-full border border-border/40 px-4 shadow-lg">
            {headerContent}
          </Glass>
        ) : (
          <div className="mx-auto flex h-16 max-w-[76rem] items-center gap-3 border border-transparent bg-transparent px-5">
            {headerContent}
          </div>
        )}

      </header>

      {mounted && mobileOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex h-dvh flex-col bg-background/95 backdrop-blur-xl lg:hidden animate-fade-in"
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
    </>
  );
}
