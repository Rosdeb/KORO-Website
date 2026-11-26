"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/features/theme/context";
import { AuthProvider } from "@/features/auth/context";
import { LanguageProvider } from "@/features/i18n/context";
import { ToastProvider } from "@/components/ui/toast";
import { shouldRetryQuery } from "@/lib/api/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: shouldRetryQuery,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: true,
          },
        },
      }),
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>{children}</ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
