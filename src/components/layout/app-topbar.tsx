"use client";

import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { Logo } from "@/components/layout/logo";
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

export function AppTopbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container-koro flex h-16 items-center gap-4">
        <Logo href="/app" />
        <div className="hidden flex-1 justify-center px-4 md:flex">
          <SearchBar size="md" className="max-w-md" />
        </div>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar>
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback>{user?.name?.slice(0, 1).toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
      </div>
    </header>
  );
}
