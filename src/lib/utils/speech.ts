/**
 * Client-side Text-to-Speech (TTS) utility using the Web Speech API.
 * Free, zero-latency, works offline and across all modern browsers and devices.
 */

export interface SpeechOptions {
  text: string;
  langCode?: string; // e.g. "en", "bn", "ccp", "mya", "rmz", "trp", "grt"
  voiceName?: string;
  rate?: number; // 0.5 - 2.0 (default 1.0)
  pitch?: number; // 0 - 2 (default 1.0)
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Maps Koro language codes to standard BCP-47 tags for SpeechSynthesis.
 */
export function mapLanguageCodeToBcp47(code?: string | null): string {
  if (!code) return "en-US";
  const normalized = code.toLowerCase().trim();

  switch (normalized) {
    case "en":
    case "eng":
      return "en-US";
    case "bn":
    case "ben":
      return "bn-BD";
    case "mya":
    case "rmz": // Marma uses Burmese / Myanmar script
    case "mnw": // Mon
      return "my-MM";
    case "hi":
    case "hin":
      return "hi-IN";
    case "ccp": // Chakma
    case "trp": // Tripura / Kokborok
    case "grt": // Garo
    case "rhg": // Rohingya
    case "sat": // Santali
      // For indigenous languages where specific TTS voices may not be built into OS,
      // fallback to bn-BD (Bengali) or en-US (phonetic reading)
      return "bn-BD";
    default:
      if (normalized.includes("-")) return normalized;
      return "en-US";
  }
}

export function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Finds the best matching voice for a given language code.
 */
export function findBestVoice(
  voices: SpeechSynthesisVoice[],
  langCode?: string,
  preferredVoiceName?: string
): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined;

  if (preferredVoiceName) {
    const matchedPreferred = voices.find((v) => v.name === preferredVoiceName);
    if (matchedPreferred) return matchedPreferred;
  }

  const bcp47 = mapLanguageCodeToBcp47(langCode);
  const langPrefix = bcp47.split("-")[0].toLowerCase();

  // 1. Exact match on BCP-47 tag (e.g. bn-BD, en-US)
  const exactMatch = voices.find(
    (v) => v.lang.toLowerCase() === bcp47.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  // 2. Prefix match on primary language subtag (e.g. bn, en, my)
  const prefixMatch = voices.find((v) =>
    v.lang.toLowerCase().startsWith(langPrefix)
  );
  if (prefixMatch) return prefixMatch;

  // 3. Default voice
  const defaultVoice = voices.find((v) => v.default);
  if (defaultVoice) return defaultVoice;

  return voices[0];
}

/**
 * Filter voices that are relevant to a given language code.
 */
export function getVoicesForLanguage(
  voices: SpeechSynthesisVoice[],
  langCode?: string
): SpeechSynthesisVoice[] {
  if (voices.length === 0) return [];
  const bcp47 = mapLanguageCodeToBcp47(langCode);
  const langPrefix = bcp47.split("-")[0].toLowerCase();

  const matching = voices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith(langPrefix) ||
      v.lang.toLowerCase().includes(langPrefix)
  );

  return matching.length > 0 ? matching : voices;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  } catch (err) {
    console.error("Error stopping speech synthesis:", err);
  }
}

export function speakText({
  text,
  langCode,
  voiceName,
  rate = 1.0,
  pitch = 1.0,
  onStart,
  onEnd,
  onError,
}: SpeechOptions): void {
  if (!isSpeechSupported()) {
    onError?.(new Error("Speech synthesis is not supported in this browser."));
    return;
  }

  if (!text || text.trim() === "") {
    return;
  }

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = mapLanguageCodeToBcp47(langCode);
  utterance.rate = Math.max(0.5, Math.min(2.0, rate));
  utterance.pitch = Math.max(0.1, Math.min(2.0, pitch));

  const voices = getAvailableVoices();
  const selectedVoice = findBestVoice(voices, langCode, voiceName);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
    // If voice has explicit language, use it to avoid browser language mismatch
    if (selectedVoice.lang) {
      utterance.lang = selectedVoice.lang;
    }
  }

  utterance.onstart = () => {
    activeUtterance = utterance;
    onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    // Interrupted errors happen normally when user stops or starts new speech
    if (e.error !== "interrupted" && e.error !== "canceled") {
      onError?.(e);
    } else {
      onEnd?.();
    }
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    activeUtterance = null;
    onError?.(err);
  }
}
