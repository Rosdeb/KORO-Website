import { NextResponse } from "next/server";
import { backendBaseUrl, setRefreshCookie } from "@/lib/api/server-auth";

export async function POST(req: Request) {
  const body = await req.json();

  const backendRes = await fetch(`${backendBaseUrl()}/auth/login`, {
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

  const accessToken = data.accessToken ?? data.token;
  const refreshToken = data.refreshToken;

  const res = NextResponse.json({ accessToken, user: data.user });
  if (refreshToken) setRefreshCookie(res, refreshToken);
  return res;
}
