import { NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/api/server-auth";

export async function POST(req: Request) {
  const body = await req.json();

  const backendRes = await fetch(`${backendBaseUrl()}/api/v1/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json().catch(() => ({}));

  if (!backendRes.ok) {
    return NextResponse.json(
      { message: data?.message ?? "Could not resend verification code. Please try again." },
      { status: backendRes.status },
    );
  }

  return NextResponse.json(
    { message: data?.message ?? "Verification code resent." },
    { status: backendRes.status },
  );
}
