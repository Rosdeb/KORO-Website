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

    // 1. Try Google Translate clients5 endpoint (dict-chrome-ex client is fast & reliable)
    try {
      const gUrl = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sourceLang}&tl=${targetLang}&q=${encodeURIComponent(
        trimmedText
      )}`;
      const gRes = await fetch(gUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (gRes.ok) {
        const gData = await gRes.json();
        if (Array.isArray(gData) && gData.length > 0) {
          const first = gData[0];
          const result = Array.isArray(first) ? first[0] : first;
          if (typeof result === "string" && result.trim()) {
            return NextResponse.json({ translatedText: result.trim() });
          }
        }
      }
    } catch {
      // Fallback
    }

    // 2. Try Google Translate gtx single endpoint
    try {
      const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        trimmedText
      )}`;
      const gtxRes = await fetch(gtxUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (gtxRes.ok) {
        const gtxData = await gtxRes.json();
        if (Array.isArray(gtxData) && Array.isArray(gtxData[0])) {
          const translatedText = gtxData[0]
            .map((item: unknown[]) => (item && typeof item[0] === "string" ? item[0] : ""))
            .join("")
            .trim();
          if (translatedText) {
            return NextResponse.json({ translatedText });
          }
        }
      }
    } catch {
      // Fallback
    }

    // 3. Fallback to MyMemory API
    try {
      const mUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        trimmedText
      )}&langpair=${sourceLang}|${targetLang}`;
      const mRes = await fetch(mUrl, { signal: AbortSignal.timeout(6000) });
      if (mRes.ok) {
        const mData = await mRes.json();
        if (mData?.responseData?.translatedText) {
          return NextResponse.json({
            translatedText: mData.responseData.translatedText.trim(),
          });
        }
      }
    } catch {
      // Return empty
    }

    return NextResponse.json({ translatedText: "" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 }
    );
  }
}
