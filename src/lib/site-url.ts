import { headers } from "next/headers";

export async function getSiteUrl(): Promise<string> {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return new URL(configuredUrl).origin;
  }

  const requestHeaders = await headers();

  const host = requestHeaders.get("host") ?? "localhost:3000";

  const forwardedProto = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();

  const protocol =
    forwardedProto ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return new URL(`${protocol}://${host}`).origin;
}