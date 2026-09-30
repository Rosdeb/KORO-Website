import { NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/api/server-auth";

export async function POST(req: Request) {
  const body = await req.json();

  const backendRes = await fetch(`${backendBaseUrl()}/api/v1/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json().catch(() => ({}));

  if (!backendRes.ok) {
    return NextResponse.json(
      { message: data?.message ?? "Invalid, expired, or already-used verification code." },
      { status: backendRes.status },
    );
  }

  return NextResponse.json(
    { message: data?.message ?? "Email verified successfully." },
    { status: backendRes.status },
  );
}
