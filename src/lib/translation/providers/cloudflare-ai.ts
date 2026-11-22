import { TranslationProvider, LanguageCode } from "../types";

export class CloudflareWorkersAIProvider implements TranslationProvider {
  readonly name = "cloudflare-workers-ai";

  private mapLanguage(code: LanguageCode): string {
    return code === "bn" ? "bengali" : "english";
  }

  async isAvailable(): Promise<boolean> {
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = await getCloudflareContext({ async: true });
      const env = ctx?.env as { AI?: unknown } | undefined;
      if (env?.AI) return true;
    } catch {
      // Not in Cloudflare worker runtime
    }

    if (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID) {
      return true;
    }

    return false;
  }

  async translate(text: string, from: LanguageCode, to: LanguageCode): Promise<string | null> {
    // 1. Native Cloudflare Workers AI binding (@cf/meta/m2m100-1.2b)
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = await getCloudflareContext({ async: true });
      const env = ctx?.env as {
        AI?: {
          run: (
            model: string,
            inputs: { text: string; source_lang: string; target_lang: string }
          ) => Promise<{ translated_text?: string }>;
        };
      } | undefined;

      if (env?.AI?.run) {
        const res = await env.AI.run("@cf/meta/m2m100-1.2b", {
          text,
          source_lang: this.mapLanguage(from),
          target_lang: this.mapLanguage(to),
        });
        if (res?.translated_text && typeof res.translated_text === "string" && res.translated_text.trim()) {
          return res.translated_text.trim();
        }
      }
    } catch {
      // Continue to REST API fallback if available
    }

    // 2. Cloudflare REST API fallback (for dev or hybrid environments)
    if (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID) {
      try {
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;
        const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/m2m100-1.2b`;

        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            source_lang: this.mapLanguage(from),
            target_lang: this.mapLanguage(to),
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          const data = await res.json();
          const translated = data?.result?.translated_text;
          if (typeof translated === "string" && translated.trim()) {
            return translated.trim();
          }
        }
      } catch {
        // Fallback to next provider in chain
      }
    }

    return null;
  }
}
