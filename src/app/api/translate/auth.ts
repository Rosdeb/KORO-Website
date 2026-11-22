import { NextRequest } from "next/server";
import { backendBaseUrl } from "@/lib/api/server-auth";

const tokenValidationCache = new Map<string, number>();

function isTokenExpiredLocally(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    const json = typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("utf-8");
    const { exp } = JSON.parse(json);
    if (typeof exp === "number") {
      return Date.now() >= exp * 1000;
    }
  } catch {
    // If decoding fails, defer to backend check
  }
  return false;
}

export async function verifyUserAuthentication(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return false;

  if (isTokenExpiredLocally(token)) {
    return false;
  }

  const cachedExpiry = tokenValidationCache.get(token);
  if (cachedExpiry && Date.now() < cachedExpiry) {
    return true;
  }

  try {
    const res = await fetch(`${backendBaseUrl()}/api/v1/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      if (tokenValidationCache.size > 1000) {
        tokenValidationCache.clear();
      }
      tokenValidationCache.set(token, Date.now() + 60_000);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
