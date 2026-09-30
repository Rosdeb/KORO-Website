"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authApi, profileApi } from "@/lib/api/endpoints";
import { restoreAccessToken } from "@/lib/api/client";
import { mapUser } from "@/lib/api/mappers";
import { AUTH_LOGOUT_EVENT, getAccessToken, setAccessToken } from "@/lib/auth/token-store";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // A reviewer's extra permissions (the submission review queue) are also
  // granted to admins, so this covers both roles — see api_documentation.md.
  isReviewer: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    nameOrPayload: string | { name: string; email: string; password: string; nativeLanguage?: string; preferredLanguage?: string },
    email?: string,
    password?: string,
    nativeLanguage?: string,
    preferredLanguage?: string,
  ) => Promise<{ message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const pathname = usePathname();
  const requiresSession = pathname === "/app" || pathname.startsWith("/app/");
  // Public pages render immediately without session/profile requests. Derive
  // this before effects run so entering /app cannot redirect prematurely.
  const isLoading = requiresSession && !user && !sessionChecked;
  const router = useRouter();

  useEffect(() => {
    const hasStoredToken = !!getAccessToken();
    if ((!requiresSession && !hasStoredToken) || user || sessionChecked) return;
    let cancelled = false;

    async function bootstrap() {
      try {
        const accessToken = await restoreAccessToken();
        if (!accessToken || cancelled) return;
        const me = await profileApi.me();
        if (!cancelled && getAccessToken() === accessToken) setUser(mapUser(me));
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setSessionChecked(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [requiresSession, user, sessionChecked]);

  useEffect(() => {
    function handleForceLogout() {
      setUser(null);
    }
    window.addEventListener(AUTH_LOGOUT_EVENT, handleForceLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleForceLogout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setAccessToken(res.accessToken);
    const me = await profileApi.me();
    setUser(mapUser(me));
  }, []);

  const register = useCallback(
    async (
      nameOrPayload: string | { name: string; email: string; password: string; nativeLanguage?: string; preferredLanguage?: string },
      email?: string,
      password?: string,
      nativeLanguage?: string,
      preferredLanguage?: string,
    ) => {
      return authApi.register(nameOrPayload, email, password, nativeLanguage, preferredLanguage);
    },
    [],
  );

  const logout = useCallback(async () => {
    setAccessToken(null);
    setUser(null);
    await authApi.logout().catch(() => undefined);
    router.push("/");
  }, [router]);

  const isAdmin = !!user?.roles.includes("ROLE_ADMIN");
  const isReviewer = isAdmin || !!user?.roles.includes("ROLE_LANGUAGE_REVIEWER");

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, isReviewer, isAdmin, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
