import { NextRequest, NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/api/server-auth";

// Cache validated tokens in memory for 60 seconds to avoid repeating profile calls on every keystroke
const tokenValidationCache = new Map<string, number>();

function isTokenExpiredLocally(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    const json = typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("utf-8");
    const { exp } = JSON.parse(json);
    if (typeof exp === "number") {
      return Date.now() >= exp * 1000;
    }
  } catch {
    // If decoding fails, defer to backend check
  }
  return false;
}

export async function verifyUserAuthentication(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return false;

  // Reject expired tokens immediately
  if (isTokenExpiredLocally(token)) {
    return false;
  }

  // Check fast in-memory cache
  const cachedExpiry = tokenValidationCache.get(token);
  if (cachedExpiry && Date.now() < cachedExpiry) {
    return true;
  }

  // Verify against backend profile endpoint
  try {
    const res = await fetch(`${backendBaseUrl()}/api/v1/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      if (tokenValidationCache.size > 1000) {
        tokenValidationCache.clear();
      }
      tokenValidationCache.set(token, Date.now() + 60_000);
      return true;
    }
    return false;
  } catch {
    // If backend is unreachable but token is unexpired with valid structure, fail safely
    return false;
  }
}

async function translateWithAzure(text: string, from: string, to: string): Promise<string | null> {
  const key = process.env.AZURE_TRANSLATOR_KEY;
  if (!key) return null;

  const endpoint = (process.env.AZURE_TRANSLATOR_ENDPOINT || "https://api.cognitive.microsofttranslator.com").replace(/\/+$/, "");
  const region = process.env.AZURE_TRANSLATOR_REGION || "global";
  const url = `${endpoint}/translate?api-version=3.0&from=${from}&to=${to}`;

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

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const translated = data?.[0]?.translations?.[0]?.text;
  return typeof translated === "string" && translated.trim() ? translated.trim() : null;
}

async function translateWithGemini(text: string, from: string, to: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const sourceName = from === "bn" ? "Bengali" : "English";
  const targetName = to === "bn" ? "Bengali" : "English";
  const prompt = `Translate the following word or short phrase from ${sourceName} to ${targetName}. Return ONLY the direct translation without explanations or quotation marks:\n\n${text}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 60 },
      }),
      signal: AbortSignal.timeout(6000),
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof translated === "string" && translated.trim() ? translated.trim() : null;
}

async function translateWithGoogleClients5(text: string, from: string, to: string): Promise<string | null> {
  const gUrl = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${from}&tl=${to}&q=${encodeURIComponent(text)}`;
  const res = await fetch(gUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) return null;
  const gData = await res.json();
  if (Array.isArray(gData) && gData.length > 0) {
    const first = gData[0];
    const result = Array.isArray(first) ? first[0] : first;
    if (typeof result === "string" && result.trim()) {
      return result.trim();
    }
  }
  return null;
}

async function translateWithGoogleGtx(text: string, from: string, to: string): Promise<string | null> {
  const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(gtxUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) return null;
  const gtxData = await res.json();
  if (Array.isArray(gtxData) && Array.isArray(gtxData[0])) {
    const translatedText = gtxData[0]
      .map((item: unknown[]) => (item && typeof item[0] === "string" ? item[0] : ""))
      .join("")
      .trim();
    if (translatedText) {
      return translatedText;
    }
  }
  return null;
}

async function translateWithMyMemory(text: string, from: string, to: string): Promise<string | null> {
  const mUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const res = await fetch(mUrl, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) return null;
  const mData = await res.json();
  const translated = mData?.responseData?.translatedText;
  if (
    typeof translated === "string" &&
    translated.trim() &&
    !translated.startsWith("MYMEMORY WARNING")
  ) {
    return translated.trim();
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce user authentication
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

    const sourceLang = from === "bn" ? "bn" : "en";
    const targetLang = to === "bn" ? "bn" : "en";

    let translatedText: string | null = null;
    let provider: string | null = null;

    // 1. Official Azure Translator API (Recommended & generous free tier)
    try {
      translatedText = await translateWithAzure(trimmedText, sourceLang, targetLang);
      if (translatedText) provider = "azure";
    } catch {}

    // 2. Google Gemini Generative AI (Alternative official provider)
    if (!translatedText) {
      try {
        translatedText = await translateWithGemini(trimmedText, sourceLang, targetLang);
        if (translatedText) provider = "gemini";
      } catch {}
    }

    // 3. Fallback: Google Translate clients5 scraper
    if (!translatedText) {
      try {
        translatedText = await translateWithGoogleClients5(trimmedText, sourceLang, targetLang);
        if (translatedText) provider = "google-clients5";
      } catch {}
    }

    // 4. Fallback: Google Translate gtx single scraper
    if (!translatedText) {
      try {
        translatedText = await translateWithGoogleGtx(trimmedText, sourceLang, targetLang);
        if (translatedText) provider = "google-gtx";
      } catch {}
    }

    // 5. Fallback: MyMemory API
    if (!translatedText) {
      try {
        translatedText = await translateWithMyMemory(trimmedText, sourceLang, targetLang);
        if (translatedText) provider = "mymemory";
      } catch {}
    }

    if (translatedText) {
      return NextResponse.json({ translatedText, provider });
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
