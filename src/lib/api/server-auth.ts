import type { NextResponse } from "next/server";

export const REFRESH_COOKIE = "koro_refresh_token";

export function backendBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
}

export function setRefreshCookie(res: NextResponse, token: string) {
  res.cookies.set(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearRefreshCookie(res: NextResponse) {
  res.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
  });
}
