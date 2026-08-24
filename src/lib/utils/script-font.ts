/**
 * Maps a language to the CSS utility class that loads a Unicode-complete
 * font for its script. Falls back to the default UI font stack (which
 * already chains through Noto Sans Bengali) for anything unrecognized,
 * so unsupported scripts degrade to system fallbacks instead of tofu boxes.
 */
const SCRIPT_BY_LANGUAGE_CODE: Record<string, "bn" | "ccp" | "mya"> = {
  bn: "bn",
  ccp: "ccp", // Chakma
  rhg: "ccp", // Rohingya (Hanifi) content often ships alongside Chakma sources; safe fallback
  mnw: "mya",
  mya: "mya",
  rmz: "mya", // Marma — written with the Myanmar script
};

export function scriptClassFor(languageCode?: string | null): string {
  if (!languageCode) return "";
  const script = SCRIPT_BY_LANGUAGE_CODE[languageCode.toLowerCase()];
  if (!script) return "";
  return `script-${script}`;
}
