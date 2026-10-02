import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, from, to } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ translatedText: "" });
    }

    const trimmedText = text.trim();
    const sourceLang = from === "bn" ? "bn" : "en";
    const targetLang = to === "bn" ? "bn" : "en";

    // 1. Try Google Translate public endpoint
    try {
      const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        trimmedText
      )}`;
      const gRes = await fetch(gUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (gRes.ok) {
        const gData = await gRes.json();
        if (Array.isArray(gData) && Array.isArray(gData[0])) {
          const translatedText = gData[0]
            .map((item: unknown[]) => (item && typeof item[0] === "string" ? item[0] : ""))
            .join("");
          if (translatedText) {
            return NextResponse.json({ translatedText });
          }
        }
      }
    } catch {
      // Fallback to MyMemory
    }

    // 2. Fallback to MyMemory API
    try {
      const mUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        trimmedText
      )}&langpair=${sourceLang}|${targetLang}`;
      const mRes = await fetch(mUrl, { signal: AbortSignal.timeout(5000) });
      if (mRes.ok) {
        const mData = await mRes.json();
        if (mData?.responseData?.translatedText) {
          return NextResponse.json({
            translatedText: mData.responseData.translatedText,
          });
        }
      }
    } catch {
      // Return original text or empty on failure
    }

    return NextResponse.json({ translatedText: "" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 }
    );
  }
}
