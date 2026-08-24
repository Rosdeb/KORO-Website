import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendBaseUrl, clearRefreshCookie, REFRESH_COOKIE, setRefreshCookie } from "@/lib/api/server-auth";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No active session." }, { status: 401 });
  }

  const backendRes = await fetch(`${backendBaseUrl()}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await backendRes.json().catch(() => ({}));

  if (!backendRes.ok) {
    const res = NextResponse.json({ message: "Session expired." }, { status: 401 });
    clearRefreshCookie(res);
    return res;
  }

  // /api/v1/auth/refresh returns a flat { accessToken, refreshToken,
  // tokenType } — a different shape than login's nested `token` object.
  const accessToken = data.accessToken;
  const newRefreshToken = data.refreshToken;

  const res = NextResponse.json({ accessToken });
  if (newRefreshToken) setRefreshCookie(res, newRefreshToken);
  return res;
}
