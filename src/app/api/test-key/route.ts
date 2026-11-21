import { NextRequest, NextResponse } from "next/server";
import { callGeminiApi, callGroqApi } from "@/lib/ai/ai-service";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, provider = "gemini" } = await req.json();

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "অনুগ্রহ করে একটি সঠিক API Key লিখুন।" },
        { status: 400 }
      );
    }

    const testPrompt = "Hello, how are you?";
    const trimmedKey = apiKey.trim();

    if (provider === "groq") {
      const res = await callGroqApi(testPrompt, trimmedKey, "english_to_bangla");
      return NextResponse.json({
        success: true,
        providerUsed: res.providerUsed,
        message: `অভিনন্দন! ${res.providerUsed} সফলভাবে কানেক্ট হয়েছে এবং প্রস্তুত!`,
      });
    } else {
      const res = await callGeminiApi(testPrompt, trimmedKey, "english_to_bangla");
      return NextResponse.json({
        success: true,
        providerUsed: res.providerUsed,
        message: `অভিনন্দন! ${res.providerUsed} সফলভাবে কানেক্ট হয়েছে এবং প্রস্তুত!`,
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 400 }
    );
  }
}
