import { NextRequest, NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/api/server-auth";
import { defaultTranslationService, LanguageCode } from "@/lib/translation";
import { verifyUserAuthentication } from "./auth";

export async function POST(req: NextRequest) {
  try {
    const isAuthed = await verifyUserAuthentication(req);
    if (!isAuthed) {
      return NextResponse.json(
        { error: "Authentication required to use translation service." },
        { status: 401 }
      );
    }

    const { text, from, to } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ translatedText: "" });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 1000) {
      return NextResponse.json(
        { error: "Text exceeds maximum allowed length of 1000 characters." },
        { status: 400 }
      );
    }

    const sourceLang: LanguageCode = from === "bn" ? "bn" : "en";
    const targetLang: LanguageCode = to === "bn" ? "bn" : "en";

    const result = await defaultTranslationService.translate(trimmedText, sourceLang, targetLang);

    if (result && result.translatedText) {
      return NextResponse.json({
        translatedText: result.translatedText,
        provider: result.provider,
      });
    }

    return NextResponse.json(
      { error: "Translation service temporarily unavailable.", translatedText: "" },
      { status: 502 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 }
    );
  }
}
