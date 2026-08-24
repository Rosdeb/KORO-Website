"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AppTopbar } from "@/components/layout/app-topbar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppMobileNav } from "@/components/layout/app-mobile-nav";
import { OfflineBanner } from "@/components/state/offline-banner";
import { useAuth } from "@/features/auth/context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <OfflineBanner />
      <AppTopbar />
      <div className="container-koro flex flex-1 gap-8">
        <AppSidebar />
        <main className="min-w-0 flex-1 py-8 pb-24 md:pb-8">{children}</main>
      </div>
      <AppMobileNav />
    </div>
  );
}
