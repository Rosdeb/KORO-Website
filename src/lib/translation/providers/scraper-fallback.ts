import { TranslationProvider, LanguageCode } from "../types";

export class ScraperFallbackProvider implements TranslationProvider {
  readonly name = "dev-scrapers-fallback";

  isAvailable(): boolean {
    return true;
  }

  async translate(text: string, from: LanguageCode, to: LanguageCode): Promise<string | null> {
    // 1. Google Translate clients5
    try {
      const gUrl = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${from}&tl=${to}&q=${encodeURIComponent(text)}`;
      const res = await fetch(gUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          const result = Array.isArray(first) ? first[0] : first;
          if (typeof result === "string" && result.trim()) return result.trim();
        }
      }
    } catch {}

    // 2. Google Translate gtx
    try {
      const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(gtxUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const gtxData = await res.json();
        if (Array.isArray(gtxData) && Array.isArray(gtxData[0])) {
          const translatedText = gtxData[0]
            .map((item: unknown[]) => (item && typeof item[0] === "string" ? item[0] : ""))
            .join("")
            .trim();
          if (translatedText) return translatedText;
        }
      }
    } catch {}

    // 3. MyMemory API
    try {
      const mUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
      const res = await fetch(mUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const mData = await res.json();
        const translated = mData?.responseData?.translatedText;
        if (
          typeof translated === "string" &&
          translated.trim() &&
          !translated.startsWith("MYMEMORY WARNING")
        ) {
          return translated.trim();
        }
      }
    } catch {}

    return null;
  }
}
