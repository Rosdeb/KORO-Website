"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, X, LayoutGrid, LogOut, Settings, BookMarked } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/languages", label: "Languages" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container-koro flex h-16 items-center gap-4">
        <Logo />

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                pathname === link.href || pathname.startsWith(link.href + "/") ? "bg-muted text-foreground" : "",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 justify-end px-4 lg:flex">
          <SearchBar size="md" collapsible className="max-w-md" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label="Search"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="rounded-full p-2.5 text-foreground hover:bg-muted lg:hidden"
          >
            <Search className="size-5" />
          </button>

          <ThemeToggle />

          {!isLoading && !isAuthenticated && (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {!isLoading && isAuthenticated && user && (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="outline" size="sm" asChild>
                <Link href="/app">Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="size-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-full p-2.5 text-foreground hover:bg-muted md:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-border p-3 lg:hidden">
          <SearchBar autoFocus onNavigate={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background md:hidden animate-fade-in">
          <div className="container-koro flex h-16 items-center justify-between">
            <Logo />
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="rounded-full p-2.5 hover:bg-muted">
                <X className="size-5" />
              </button>
            </div>
          </div>
          <nav className="container-koro flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2 px-1 pt-2">
                <Button variant="outline" asChild onClick={() => setMobileOpen(false)}>
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="primary" asChild onClick={() => setMobileOpen(false)}>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-1 pt-2">
                <Button variant="primary" asChild onClick={() => setMobileOpen(false)}>
                  <Link href="/app">Go to Dashboard</Link>
                </Button>
                <Button variant="ghost" onClick={() => { setMobileOpen(false); logout(); }}>
                  Log out
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
