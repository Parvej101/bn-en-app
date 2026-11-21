import {
  BanglaQuickView,
  BanglishToEnglishResponse,
  TranslationApiResponse,
  AIProvider,
} from "@/types/assistant.types";

/**
 * Detects whether the input is primarily English or Banglish/Bengali
 */
export function detectLanguageMode(text: string): "english_to_bangla" | "banglish_to_english" {
  const trimmed = text.trim();
  
  // Check if text contains native Bengali script Unicode range \u0980-\u09FF
  if (/[\u0980-\u09FF]/.test(trimmed)) {
    return "banglish_to_english";
  }

  // Common Banglish phonetics and vocabulary signatures
  const banglishSignatures = [
    /\b(ami|tumi|apni|tui|amader|tomader|apnader|kemon|achen|acho|achis)\b/i,
    /\b(ki|kintu|kono|kothay|kokhon|keno|kivabe|jeno|tai|thik|ace|ache)\b/i,
    /\b(hobe|korbo|korba|koren|korle|valo|bhalo|kharap|khobor|bhai|vai)\b/i,
    /\b(ektu|aro|onek|shob|sob|shuru|sesh|bujhi|bujhte|bolte|paro|parben)\b/i,
    /\b(dekhi|dekhbo|dekhun|dite|apre|paro|asbo|ashbo|chole|gelo|jabona)\b/i,
    /\b(koris|korbo|parbo|hobe|hobena|nai|nei|lagbe|lagbena|bujhlam)\b/i,
  ];

  let banglishMatchCount = 0;
  for (const regex of banglishSignatures) {
    if (regex.test(trimmed)) {
      banglishMatchCount++;
    }
  }

  if (banglishMatchCount >= 1) {
    return "banglish_to_english";
  }

  // English words dictionary check heuristic
  const englishCommonWords = /\b(the|is|are|am|was|were|have|has|had|what|where|when|why|how|please|let|me|know|can|you|will|would|could|meeting|tomorrow|schedule|thanks|thank|hello|hi|hey|good|morning|evening|night|urgent|project|update)\b/i;
  if (englishCommonWords.test(trimmed)) {
    return "english_to_bangla";
  }

  // Default fallback: if mostly standard latin ASCII with English-like endings, treat as English
  return "english_to_bangla";
}

/**
 * Smart heuristic response generator (Instant offline fallback when API key is not configured)
 */
export function generateSmartMockResponse(
  text: string,
  mode: "english_to_bangla" | "banglish_to_english"
): TranslationApiResponse {
  const trimmed = text.trim();

  if (mode === "english_to_bangla") {
    // English -> Bangla Quick View
    const banglaView: BanglaQuickView = {
      originalText: trimmed,
      banglaTranslation:
        trimmed.length > 50
          ? "মেসেজটির মূল কথা: আপনার সাথে শিডিউল বা কাজের বিষয়ে আলোচনা করতে চাওয়া হয়েছে।"
          : "এটি একটি গুরুত্বপূর্ণ ইংরেজি বার্তা।",
      contextSummary: "বন্ধুত্বপূর্ণ ও পেশাদার মেসেজ — সরাসরি উত্তর দেওয়ার জন্য প্রস্তুত।",
      sentiment: "friendly",
      wordBreakdowns: [
        { word: "schedule", meaning: "সময়সূচী বা সময় নির্ধারণ করা" },
        { word: "convenient", meaning: "সুবিধাজনক" },
        { word: "let me know", meaning: "আমাকে জানান" },
      ],
      suggestedEnglishReplies: {
        casual: "Sure, sounds good to me! Let's do it.",
        professional: "I have received your message and will review it shortly. Thank you.",
        polite: "Thank you for letting me know. I truly appreciate your update.",
        concise: "Got it! Thanks.",
      },
    };

    // Specific common samples
    if (/meeting|schedule|tomorrow|time/i.test(trimmed)) {
      banglaView.banglaTranslation = "কালকে মিটিং বা কথা বলার সময় নিয়ে জানতে চেয়েছে। আপনার সুবিধাজনক সময় জানাতে বলেছে।";
      banglaView.contextSummary = "কাজের সময়সূচী নির্ধারণ বিষয়ক বার্তা।";
      banglaView.suggestedEnglishReplies = {
        casual: "Tomorrow 5 PM works perfectly for me. See you then!",
        professional: "Tomorrow at 5:00 PM would be ideal. I have marked it on my calendar.",
        polite: "Could we please reschedule to 5:00 PM tomorrow if that works for you?",
        concise: "Tomorrow 5 PM is confirmed.",
      };
    } else if (/urgent|asap|important/i.test(trimmed)) {
      banglaView.sentiment = "urgent";
      banglaView.banglaTranslation = "এটি একটি জরুরি বার্তা! যত দ্রুত সম্ভব উত্তর বা আপডেট দিতে অনুরোধ করা হয়েছে।";
      banglaView.contextSummary = "তাড়াতাড়ি উত্তর প্রয়োজন।";
      banglaView.suggestedEnglishReplies = {
        casual: "On it right now! Will get back to you in 10 mins.",
        professional: "I am addressing this immediately and will follow up with full details shortly.",
        polite: "Thank you for bringing this to my urgent attention. Looking into it right away.",
        concise: "Understood, handling immediately.",
      };
    } else if (/how are you|how is it going|sup|hello|hi/i.test(trimmed)) {
      banglaView.banglaTranslation = "কেমন আছেন বা কেমন চলছে জানতে চেয়েছে। একটি শুভেচ্ছা বার্তা।";
      banglaView.suggestedEnglishReplies = {
        casual: "Hey! Doing great, how about you?",
        professional: "Hello! I am doing well, thank you. Hope you are having a productive week.",
        polite: "I am doing well, thank you so much for asking! How are things with you?",
        concise: "All good here! Hope you're well too.",
      };
    }

    return {
      success: true,
      mode: "english_to_bangla",
      banglaView,
      providerUsed: "BN-ENG Smart Engine (Demo Mode)",
    };
  } else {
    // Banglish -> 4-Tone English Replies
    let detectedMeaning = "আপনি সময় বা কোনো কাজের বিষয়ে প্রস্তাব বা সম্মতি জানাচ্ছেন।";
    let replies = {
      casual: "Hey, could we do the meeting tomorrow at 5? I'll be a bit busy earlier.",
      professional: "Would it be possible to reschedule our meeting to 5:00 PM tomorrow? I have a prior commitment.",
      polite: "I would be very grateful if we could meet tomorrow at 5:00 PM, as I have an engagement earlier.",
      concise: "Can we meet tomorrow at 5 PM instead? Busy earlier.",
    };

    if (/kemon|achen|acho|vai|bhai/i.test(trimmed)) {
      detectedMeaning = "কুশল বিনিময় ও শুভেচ্ছা বার্তা।";
      replies = {
        casual: "Hey brother, how are you doing these days?",
        professional: "Hello, hope you are doing well and having a great day.",
        polite: "Warm greetings! I hope you and your family are doing wonderful.",
        concise: "Hey! How have you been?",
      };
    } else if (/taka|payment|send|pathiye|bill/i.test(trimmed)) {
      detectedMeaning = "টাকা বা পেমেন্ট সংক্রান্ত তথ্য বা প্রশ্ন।";
      replies = {
        casual: "Hey, did you get a chance to send the payment yet?",
        professional: "Kindly verify if the payment has been processed from your side. Thank you.",
        polite: "Could you please confirm once the payment transfer is completed at your convenience?",
        concise: "Please share the payment update when done.",
      };
    } else if (/kaj|work|done|sesh|shesh/i.test(trimmed)) {
      detectedMeaning = "কাজের অগ্রগতি বা কাজ শেষ হওয়ার বিষয়।";
      replies = {
        casual: "All done with the task! Let me know if you need any tweaks.",
        professional: "The assigned work has been completed successfully. Please review the deliverables.",
        polite: "I am pleased to inform you that the work is finished. Please feel free to share your feedback.",
        concise: "Task completed. Ready for review.",
      };
    }

    const banglishReplies: BanglishToEnglishResponse = {
      originalBanglish: trimmed,
      detectedBanglishMeaning: detectedMeaning,
      replies,
    };

    return {
      success: true,
      mode: "banglish_to_english",
      banglishReplies,
      providerUsed: "BN-ENG Smart Engine (Demo Mode)",
    };
  }
}

function cleanQuotes(str: string): string {
  if (!str) return "";
  return str.replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();
}

function extractJsonObject(rawText: string): Record<string, unknown> {
  const cleaned = rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("AI response did not contain valid JSON");
  }
  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
}

let cachedGeminiModel: string | null = null;
let cachedGroqModel: string | null = null;

/**
 * Call Google Gemini API with fast model priority & caching
 */
export async function callGeminiApi(
  text: string,
  apiKey: string,
  mode: "english_to_bangla" | "banglish_to_english"
): Promise<TranslationApiResponse> {
  const systemPrompt =
    mode === "english_to_bangla"
      ? `You are an expert bilingual English to Bangla translator for mobile chat messages (WhatsApp/Messenger).
IMPORTANT: Do NOT enclose suggested replies in quotation marks.
The user provides an English message.
Provide output ONLY in strict JSON format:
{
  "originalText": "...",
  "banglaTranslation": "natural, fluent conversational Bengali translation",
  "contextSummary": "short 1-sentence explanation of what the sender wants",
  "sentiment": "friendly" | "formal" | "urgent" | "neutral",
  "wordBreakdowns": [
    {"word": "english word", "meaning": "bangla meaning"}
  ],
  "suggestedEnglishReplies": {
    "casual": "friendly conversational reply without quotes",
    "professional": "workplace professional reply without quotes",
    "polite": "respectful and warm reply without quotes",
    "concise": "short 3-5 word reply without quotes"
  }
}`
      : `You are an expert Banglish (Bengali written in English alphabet) and Bengali to polished English translator.
IMPORTANT: Do NOT enclose replies in quotation marks.
The user provides Banglish or Bengali text typed into a mobile chat box (WhatsApp/Messenger).
Understand their intent deeply (including Bangladeshi colloquial slang, tone, and cultural nuances).
Provide output ONLY in strict JSON format:
{
  "originalBanglish": "...",
  "detectedBanglishMeaning": "বাংলা অর্থ ও উদ্দেশ্যের এক লাইনের ব্যাখ্যা",
  "replies": {
    "casual": "Natural English for friends/informal chats without quotes",
    "professional": "Polished English for clients, bosses, or business without quotes",
    "polite": "Courteous, gentle, and respectful English without quotes",
    "concise": "Ultra brief, quick 3-7 word English without quotes"
  }
}`;

  const trimmedKey = apiKey.trim();
  let modelsToTry = cachedGeminiModel
    ? [cachedGeminiModel, "gemini-3.8-flash", "gemini-2.0-flash", "gemini-flash-latest"]
    : ["gemini-3.8-flash", "gemini-2.0-flash", "gemini-flash-latest"];

  if (!cachedGeminiModel) {
    try {
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(trimmedKey)}`
      );
      if (listRes.status === 400 || listRes.status === 401 || listRes.status === 403) {
        const errBody = await listRes.text();
        throw new Error(`আপনার Gemini API Key টি সঠিক নয় (${listRes.status}): ${errBody}`);
      }
      if (listRes.ok) {
        const listData = await listRes.json();
        const skipPatterns = ["tts", "image", "vision", "embedding", "aqa", "gemma", "audio", "live", "robotics", "computer-use", "learnlm"];
        const discovered: string[] = (listData.models || [])
          .filter((m: { supportedGenerationMethods?: string[]; name: string }) => {
            const n = m.name.toLowerCase();
            return (
              m.supportedGenerationMethods?.includes("generateContent") &&
              n.includes("gemini") &&
              !skipPatterns.some((p) => n.includes(p))
            );
          })
          .map((m: { name: string }) => m.name.replace("models/", ""));

        if (discovered.length > 0) {
          discovered.sort((a, b) => {
            const score = (name: string) => {
              if (name === "gemini-3.8-flash") return 0;
              if (name.includes("3.8") && name.includes("flash")) return 1;
              if (name === "gemini-2.0-flash") return 2;
              if (name.includes("flash-lite")) return 3;
              if (name.includes("flash") && !name.includes("thinking")) return 4;
              if (name.includes("flash")) return 5;
              return 6;
            };
            return score(a) - score(b);
          });
          modelsToTry = discovered.slice(0, 4);
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("API Key টি সঠিক নয়")) {
        throw e;
      }
    }
  }

  // Deduplicate list
  modelsToTry = [...new Set(modelsToTry)];
  const errors: string[] = [];

  for (const modelName of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(trimmedKey)}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nUser Input:\n${text}` }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 512,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 401 || response.status === 403) {
          throw new Error(`API Key অনুমোদিত নয় (${response.status}): ${errText}`);
        }
        if (cachedGeminiModel === modelName) cachedGeminiModel = null;
        errors.push(`${modelName} (${response.status})`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        errors.push(`${modelName} (empty response)`);
        continue;
      }

      const parsed = extractJsonObject(rawText);
      cachedGeminiModel = modelName;

      if (mode === "english_to_bangla") {
        const bv = parsed as unknown as BanglaQuickView;
        if (bv.suggestedEnglishReplies) {
          bv.suggestedEnglishReplies.casual = cleanQuotes(bv.suggestedEnglishReplies.casual);
          bv.suggestedEnglishReplies.professional = cleanQuotes(bv.suggestedEnglishReplies.professional);
          bv.suggestedEnglishReplies.polite = cleanQuotes(bv.suggestedEnglishReplies.polite);
          bv.suggestedEnglishReplies.concise = cleanQuotes(bv.suggestedEnglishReplies.concise);
        }
        return {
          success: true,
          mode: "english_to_bangla",
          banglaView: bv,
          providerUsed: `Google Gemini (${modelName})`,
        };
      } else {
        const br = parsed as unknown as BanglishToEnglishResponse;
        if (br.replies) {
          br.replies.casual = cleanQuotes(br.replies.casual);
          br.replies.professional = cleanQuotes(br.replies.professional);
          br.replies.polite = cleanQuotes(br.replies.polite);
          br.replies.concise = cleanQuotes(br.replies.concise);
        }
        return {
          success: true,
          mode: "banglish_to_english",
          banglishReplies: br,
          providerUsed: `Google Gemini (${modelName})`,
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("অনুমোদিত নয়")) throw err;
      errors.push(`${modelName}: ${msg}`);
    }
  }

  throw new Error(`Gemini সংযোগ ব্যর্থ (${errors.slice(0, 2).join(" | ")})`);
}

/**
 * Call Groq API with dynamic active models discovery
 */
export async function callGroqApi(
  text: string,
  apiKey: string,
  mode: "english_to_bangla" | "banglish_to_english"
): Promise<TranslationApiResponse> {
  const systemPrompt =
    mode === "english_to_bangla"
      ? `You are an expert bilingual English to Bangla translator for mobile chats. Respond in strictly valid JSON format without quotes around replies:
{
  "originalText": "...",
  "banglaTranslation": "natural, fluent conversational Bengali translation",
  "contextSummary": "short 1-sentence explanation of what the sender wants",
  "sentiment": "friendly",
  "wordBreakdowns": [{"word": "example", "meaning": "উদাহরণ"}],
  "suggestedEnglishReplies": {
    "casual": "friendly conversational reply",
    "professional": "workplace professional reply",
    "polite": "respectful and warm reply",
    "concise": "short 3-5 word reply"
  }
}`
      : `You are an expert translator converting Banglish (Bengali in English alphabet) to polished English. Respond in strictly valid JSON format without quotes around replies:
{
  "originalBanglish": "...",
  "detectedBanglishMeaning": "বাংলা অর্থ ও উদ্দেশ্যের এক লাইনের ব্যাখ্যা",
  "replies": {
    "casual": "Natural English for friends/informal chats",
    "professional": "Polished English for clients, bosses, or business",
    "polite": "Courteous, gentle, and respectful English",
    "concise": "Ultra brief, quick 3-7 word English"
  }
}`;

  const trimmedKey = apiKey.trim();
  let groqModels = cachedGroqModel
    ? [cachedGroqModel, "llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
    : ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

  if (!cachedGroqModel) {
    try {
      const modelsResp = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${trimmedKey}` },
      });
      if (modelsResp.status === 401 || modelsResp.status === 403) {
        const errBody = await modelsResp.text();
        throw new Error(`আপনার Groq API Key টি সঠিক নয় (${modelsResp.status}): ${errBody}`);
      }
      if (modelsResp.ok) {
        const modelsData = await modelsResp.json();
        const skipPatterns = ["whisper", "embed", "vision", "guard", "tts", "playai", "safeguard", "compound", "orpheus"];
        const active: string[] = (modelsData.data || [])
          .filter((m: { active?: boolean; id: string }) => {
            const id = m.id.toLowerCase();
            return m.active !== false && !skipPatterns.some((p) => id.includes(p));
          })
          .map((m: { id: string }) => m.id);

        if (active.length > 0) {
          active.sort((a, b) => {
            const score = (id: string) => {
              if (id === "llama-3.3-70b-versatile") return 0;
              if (id === "llama-3.1-8b-instant") return 1;
              if (id.includes("llama-4")) return 2;
              if (id.includes("llama")) return 3;
              return 4;
            };
            return score(a) - score(b);
          });
          groqModels = active.slice(0, 4);
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("API Key টি সঠিক নয়")) {
        throw e;
      }
    }
  }

  groqModels = [...new Set(groqModels)];

  const errors: string[] = [];

  for (const model of groqModels) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${trimmedKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Groq API Key অনুমোদিত নয় (${response.status}): ${errText}`);
        }
        errors.push(`${model} (${response.status}): ${errText.slice(0, 120)}`);
        continue;
      }

      const data = await response.json();
      const rawContent = data?.choices?.[0]?.message?.content;
      if (!rawContent) {
        errors.push(`${model} (empty response)`);
        continue;
      }

      const parsed = extractJsonObject(rawContent);
      cachedGroqModel = model;

      if (mode === "english_to_bangla") {
        const bv = parsed as unknown as BanglaQuickView;
        if (bv.suggestedEnglishReplies) {
          bv.suggestedEnglishReplies.casual = cleanQuotes(bv.suggestedEnglishReplies.casual);
          bv.suggestedEnglishReplies.professional = cleanQuotes(bv.suggestedEnglishReplies.professional);
          bv.suggestedEnglishReplies.polite = cleanQuotes(bv.suggestedEnglishReplies.polite);
          bv.suggestedEnglishReplies.concise = cleanQuotes(bv.suggestedEnglishReplies.concise);
        }
        return {
          success: true,
          mode: "english_to_bangla",
          banglaView: bv,
          providerUsed: `Groq (${model})`,
        };
      } else {
        const br = parsed as unknown as BanglishToEnglishResponse;
        if (br.replies) {
          br.replies.casual = cleanQuotes(br.replies.casual);
          br.replies.professional = cleanQuotes(br.replies.professional);
          br.replies.polite = cleanQuotes(br.replies.polite);
          br.replies.concise = cleanQuotes(br.replies.concise);
        }
        return {
          success: true,
          mode: "banglish_to_english",
          banglishReplies: br,
          providerUsed: `Groq (${model})`,
        };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("অনুমোদিত নয়")) throw err;
      errors.push(`${model}: ${msg}`);
    }
  }

  throw new Error(`Groq সংযোগ ব্যর্থ (${errors.slice(0, 2).join(" | ")})`);
}
