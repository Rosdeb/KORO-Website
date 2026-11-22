import { TranslationProvider, TranslationResult, LanguageCode } from "./types";
import { GeminiTranslationProvider } from "./providers/gemini";
import { CloudflareWorkersAIProvider } from "./providers/cloudflare-ai";
import { AzureTranslatorProvider } from "./providers/azure-translator";
import { ScraperFallbackProvider } from "./providers/scraper-fallback";

export class TranslationService {
  private providers: TranslationProvider[];

  constructor(providers?: TranslationProvider[]) {
    // Gemini AI is primary when GEMINI_API_KEY is configured
    this.providers = providers ?? [
      new GeminiTranslationProvider(),
      new CloudflareWorkersAIProvider(),
      new AzureTranslatorProvider(),
      new ScraperFallbackProvider(),
    ];
  }

  getProviders(): readonly TranslationProvider[] {
    return this.providers;
  }

  async translate(text: string, from: LanguageCode, to: LanguageCode): Promise<TranslationResult | null> {
    const trimmed = text.trim();
    if (!trimmed) return null;

    for (const provider of this.providers) {
      try {
        const available = await provider.isAvailable();
        if (!available) continue;

        const result = await provider.translate(trimmed, from, to);
        if (result && result.trim()) {
          return {
            translatedText: result.trim(),
            provider: provider.name,
          };
        }
      } catch (error) {
        console.warn(`Translation provider ${provider.name} failed:`, error);
      }
    }

    return null;
  }
}

export const defaultTranslationService = new TranslationService();
