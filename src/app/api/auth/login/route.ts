import { NextResponse } from "next/server";
import { backendBaseUrl, setRefreshCookie } from "@/lib/api/server-auth";

// Backend returns { id, name, email, roles, token: { access_token, refresh_token } }
// on /api/v1/auth/login — not a flat { user, accessToken } envelope, and it
// doesn't include profile fields (avatar, languages), so the client fetches
// the full profile separately via GET /users/profile after this resolves.
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

  const accessToken = data.token?.access_token;
  const refreshToken = data.token?.refresh_token;

  const res = NextResponse.json({ accessToken });
  if (refreshToken) setRefreshCookie(res, refreshToken);
  return res;
}
