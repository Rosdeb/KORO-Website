import { NextResponse } from "next/server";
import { backendBaseUrl, setRefreshCookie } from "@/lib/api/server-auth";

export async function POST(req: Request) {
  const body = await req.json();

  const backendRes = await fetch(`${backendBaseUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json().catch(() => ({}));

  if (!backendRes.ok) {
    return NextResponse.json(
      { message: data?.message ?? "Invalid email or password." },
      { status: backendRes.status },
    );
  }

  const accessToken =
    data.token?.access_token ??
    data.token?.accessToken ??
    data.accessToken ??
    data.access_token;

  const refreshToken =
    data.token?.refresh_token ??
    data.token?.refreshToken ??
    data.refreshToken ??
    data.refresh_token;

  const res = NextResponse.json({ accessToken });
  if (refreshToken) setRefreshCookie(res, refreshToken);
  return res;
}
