"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AppTopbar } from "@/components/layout/app-topbar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppMobileNav } from "@/components/layout/app-mobile-nav";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { OfflineBanner } from "@/components/state/offline-banner";
import { useAuth } from "@/features/auth/context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
    // pathname intentionally excluded: including it re-runs on every navigation
    // and causes an infinite redirect loop once the router.replace fires
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
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
      <ScrollToTop />
    </div>
  );
}
