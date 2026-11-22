import { TranslationProvider, LanguageCode } from "../types";

export class GeminiTranslationProvider implements TranslationProvider {
  readonly name = "google-gemini";

  isAvailable(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  private cleanOutput(raw: string): string {
    let text = raw.trim();
    // Remove markdown code fences if model wrapped in ```
    text = text.replace(/^```[a-z]*\n?([\s\S]*?)```$/i, "$1").trim();
    // Remove leading/trailing quotation marks
    text = text.replace(/^["'“”‘«»]+|["'“”‘«»]+$/g, "").trim();
    // Remove trailing period if it was a single word or short phrase
    if (!text.includes("\n") && text.endsWith(".")) {
      text = text.slice(0, -1).trim();
    }
    return text;
  }

  async translate(text: string, from: LanguageCode, to: LanguageCode): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const sourceName = from === "bn" ? "Bengali" : "English";
    const targetName = to === "bn" ? "Bengali" : "English";
    const prompt = `Translate the following word or short phrase from ${sourceName} to ${targetName}. Provide ONLY the direct translation, with no explanations, notes, punctuation, quotes, or markdown:\n\n${text}`;

    // Prefer fast gemini-flash-lite-latest, fallback to gemini-3.8-flash if needed
    const models = ["gemini-flash-lite-latest", "gemini-3.8-flash", "gemini-flash-latest"];

    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 60,
              },
            }),
            signal: AbortSignal.timeout(6000),
          }
        );

        if (!res.ok) continue;

        const data = await res.json();
        const rawTranslated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof rawTranslated === "string" && rawTranslated.trim()) {
          const cleaned = this.cleanOutput(rawTranslated);
          if (cleaned) return cleaned;
        }
      } catch {
        // Try next model
      }
    }

    return null;
  }
}
