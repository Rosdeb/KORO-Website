import { TranslationProvider, LanguageCode } from "../types";

export class AzureTranslatorProvider implements TranslationProvider {
  readonly name = "azure-translator";

  isAvailable(): boolean {
    return Boolean(process.env.AZURE_TRANSLATOR_KEY);
  }

  async translate(text: string, from: LanguageCode, to: LanguageCode): Promise<string | null> {
    const key = process.env.AZURE_TRANSLATOR_KEY;
    if (!key) return null;

    const endpoint = (process.env.AZURE_TRANSLATOR_ENDPOINT || "https://api.cognitive.microsofttranslator.com").replace(/\/+$/, "");
    const region = process.env.AZURE_TRANSLATOR_REGION || "global";
    const url = `${endpoint}/translate?api-version=3.0&from=${from}&to=${to}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ Text: text }]),
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) return null;

      const data = await res.json();
      const translated = data?.[0]?.translations?.[0]?.text;
      return typeof translated === "string" && translated.trim() ? translated.trim() : null;
    } catch {
      return null;
    }
  }
}
