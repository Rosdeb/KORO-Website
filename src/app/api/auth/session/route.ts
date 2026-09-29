import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { REFRESH_COOKIE } from "@/lib/api/server-auth";

export async function GET() {
  const cookieStore = await cookies();
  return NextResponse.json(
    { hasSession: !!cookieStore.get(REFRESH_COOKIE)?.value },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
