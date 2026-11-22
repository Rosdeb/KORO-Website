export type LanguageCode = "bn" | "en";

export interface TranslationResult {
  translatedText: string;
  provider: string;
}

export interface TranslationProvider {
  readonly name: string;
  isAvailable(): Promise<boolean> | boolean;
  translate(text: string, from: LanguageCode, to: LanguageCode): Promise<string | null>;
}
