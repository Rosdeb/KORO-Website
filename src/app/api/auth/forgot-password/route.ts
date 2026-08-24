import { NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/api/server-auth";

export async function POST(req: Request) {
  const body = await req.json();

  const backendRes = await fetch(`${backendBaseUrl()}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json().catch(() => ({}));

  if (!backendRes.ok) {
    return NextResponse.json(
      { message: data?.message ?? "Something went wrong. Please try again." },
      { status: backendRes.status },
    );
  }

  return NextResponse.json({ message: "If an account exists for that email, a reset link has been sent." });
}
