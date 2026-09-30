import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendBaseUrl, clearRefreshCookie, REFRESH_COOKIE, setRefreshCookie } from "@/lib/api/server-auth";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No active session." }, { status: 401 });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${backendBaseUrl()}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json(
      { message: "Session service unavailable." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const data = await backendRes.json().catch(() => ({}));

  if (!backendRes.ok) {
    const expired = backendRes.status === 401 || backendRes.status === 403;
    const res = NextResponse.json(
      { message: expired ? "Session expired." : "Session service unavailable." },
      { status: expired ? 401 : backendRes.status, headers: { "Cache-Control": "private, no-store" } },
    );
    if (expired) clearRefreshCookie(res);
    return res;
  }

  const accessToken =
    data.accessToken ??
    data.access_token ??
    data.token?.access_token ??
    data.token?.accessToken;

  const newRefreshToken =
    data.refreshToken ??
    data.refresh_token ??
    data.token?.refresh_token ??
    data.token?.refreshToken;

  if (typeof accessToken !== "string" || !accessToken) {
    return NextResponse.json(
      { message: "Invalid session response." },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  const res = NextResponse.json({ accessToken }, { headers: { "Cache-Control": "private, no-store" } });
  if (newRefreshToken) setRefreshCookie(res, newRefreshToken);
  return res;
}
