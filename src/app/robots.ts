import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/app",
        "/api/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/search",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}