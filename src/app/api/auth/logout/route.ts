import { NextResponse } from "next/server";
import { clearRefreshCookie } from "@/lib/api/server-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearRefreshCookie(res);
  return res;
}
