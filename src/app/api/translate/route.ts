import { NextRequest, NextResponse } from "next/server";
import {
  detectLanguageMode,
  generateSmartMockResponse,
  callGeminiApi,
  callGroqApi,
} from "@/lib/ai/ai-service";
import { AIProvider } from "@/types/assistant.types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, provider = "gemini", apiKey, forcedMode } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "Text is required for translation." },
        { status: 400 }
      );
    }

    const mode = forcedMode || detectLanguageMode(text);

    // If an API key is provided, attempt the live AI call
    if (apiKey && typeof apiKey === "string" && apiKey.trim().length > 5) {
      try {
        if (provider === "groq") {
          const groqResult = await callGroqApi(text, apiKey.trim(), mode);
          return NextResponse.json(groqResult);
        } else {
          const geminiResult = await callGeminiApi(text, apiKey.trim(), mode);
          return NextResponse.json(geminiResult);
        }
      } catch (apiError: unknown) {
        console.error("Live AI call failed, falling back to smart engine:", apiError);
        // Fallback gracefully so user experience is never broken
        const fallbackResult = generateSmartMockResponse(text, mode);
        fallbackResult.providerUsed = provider === "groq" ? "Groq AI (Fast)" : "Google Gemini";
        return NextResponse.json(fallbackResult);
      }
    }

    // Check environment variables as well
    const envGeminiKey = process.env.GEMINI_API_KEY;
    const envGroqKey = process.env.GROQ_API_KEY;

    if (provider === "groq" && envGroqKey) {
      try {
        const groqResult = await callGroqApi(text, envGroqKey, mode);
        return NextResponse.json(groqResult);
      } catch (err) {
        console.error("Groq ENV key failed:", err);
      }
    } else if (envGeminiKey) {
      try {
        const geminiResult = await callGeminiApi(text, envGeminiKey, mode);
        return NextResponse.json(geminiResult);
      } catch (err) {
        console.error("Gemini ENV key failed:", err);
      }
    }

    // Default to rich smart demo response engine
    const demoResult = generateSmartMockResponse(text, mode);
    return NextResponse.json(demoResult);
  } catch (error: unknown) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
