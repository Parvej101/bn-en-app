export type AIProvider = "gemini" | "groq";

export type ReplyTone = "casual" | "professional" | "polite" | "concise";

export interface WordBreakdown {
  word: string;
  meaning: string;
  banglaPhonetic?: string;
}

export interface BanglaQuickView {
  originalText: string;
  banglaTranslation: string;
  contextSummary: string;
  sentiment: "friendly" | "formal" | "urgent" | "neutral";
  wordBreakdowns: WordBreakdown[];
  suggestedEnglishReplies: {
    casual: string;
    professional: string;
    polite: string;
    concise: string;
  };
}

export interface BanglishToEnglishResponse {
  originalBanglish: string;
  detectedBanglishMeaning: string;
  replies: {
    casual: string;
    professional: string;
    polite: string;
    concise: string;
  };
}

export interface TranslationApiResponse {
  success: boolean;
  mode: "english_to_bangla" | "banglish_to_english";
  banglaView?: BanglaQuickView;
  banglishReplies?: BanglishToEnglishResponse;
  providerUsed: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  sender: "friend" | "me";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
  detectedLanguage?: "english" | "banglish" | "bangla";
}
