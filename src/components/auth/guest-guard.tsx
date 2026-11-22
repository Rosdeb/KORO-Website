"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { restoreAccessToken } from "@/lib/api/client";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [checkingSession, setCheckingSession] = useState(false);

  // If on verify-email with an email query param, allow verification flow to proceed
  const isVerifyingWithEmail = pathname === "/verify-email" && Boolean(searchParams.get("email"));

  useEffect(() => {
    if (isVerifyingWithEmail) return;

    // 1. If already authenticated in memory/context, redirect to /app (or returnTo)
    if (isAuthenticated) {
      const returnTo = searchParams.get("returnTo");
      router.replace(returnTo ? decodeURIComponent(returnTo) : "/app");
      return;
    }

    // 2. If not marked authenticated yet, check if an active session cookie exists
    let cancelled = false;
    async function checkExistingSession() {
      try {
        setCheckingSession(true);
        const token = await restoreAccessToken();
        if (token && !cancelled) {
          const returnTo = searchParams.get("returnTo");
          router.replace(returnTo ? decodeURIComponent(returnTo) : "/app");
        }
      } catch {
        // No active session or unauthenticated
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    checkExistingSession();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isVerifyingWithEmail, router, searchParams]);

  if (!isVerifyingWithEmail && (isAuthenticated || checkingSession)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 text-center">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return <>{children}</>;
}
