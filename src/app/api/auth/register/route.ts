import { NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/api/server-auth";

// /api/v1/auth/register only returns a { message } confirmation — no
// tokens — so registering doesn't log the user in. The client follows up
// with a normal login call using the same credentials.
export async function POST(req: Request) {
  const body = await req.json();

  const backendRes = await fetch(`${backendBaseUrl()}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json().catch(() => ({}));

  if (!backendRes.ok) {
    return NextResponse.json(
      { message: data?.message ?? "Could not create your account. Please try again." },
      { status: backendRes.status },
    );
  }

  return NextResponse.json({ message: data?.message ?? "Account created." });
}
