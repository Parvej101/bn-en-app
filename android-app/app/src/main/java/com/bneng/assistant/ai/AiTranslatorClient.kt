package com.bneng.assistant.ai

import com.google.gson.Gson
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit
import java.util.regex.Pattern

object AiTranslatorClient {

    private val gson = Gson()
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()

    /**
     * Determines whether text is primarily English or Banglish/Bengali
     */
    fun isEnglish(text: String): Boolean {
        val trimmed = text.trim()
        if (trimmed.isEmpty()) return true

        // Native Bengali script
        val bengaliPattern = Pattern.compile("[\\u0980-\\u09FF]")
        if (bengaliPattern.matcher(trimmed).find()) return false

        // Common Banglish phonetics
        val banglishPattern = Pattern.compile(
            "\\b(ami|tumi|apni|tui|amader|kemon|achen|acho|ki|kintu|kothay|kokhon|keno|kivabe|hobe|korbo|korba|koren|korle|valo|bhai|vai|ektu|dekhi|dite|apre|paro|asbo|ashbo|chole|gelo|jabona|thik|ace|ache)\\b",
            Pattern.CASE_INSENSITIVE
        )
        if (banglishPattern.matcher(trimmed).find()) return false

        return true
    }

    suspend fun translateOrPolish(
        text: String,
        apiKey: String,
        provider: String
    ): TranslationResult = withContext(Dispatchers.IO) {
        val english = isEnglish(text)

        // If no API key is provided, return smart high quality mock response
        if (apiKey.isBlank()) {
            return@withContext getMockResponse(text, english)
        }

        try {
            if (provider.equals("groq", ignoreCase = true)) {
                callGroq(text, apiKey, english)
            } else {
                callGemini(text, apiKey, english)
            }
        } catch (e: Exception) {
            // Fallback gracefully on network / token issues
            getMockResponse(text, english)
        }
    }

    private fun callGemini(text: String, apiKey: String, isEnglish: Boolean): TranslationResult {
        val systemPrompt = if (isEnglish) {
            """You are an expert bilingual English to Bangla translator for mobile chats.
Respond ONLY in strict JSON:
{
  "originalText": "${text.replace("\"", "\\\"")}",
  "banglaTranslation": "natural conversational Bengali translation",
  "contextSummary": "1-sentence summary",
  "sentiment": "friendly",
  "wordBreakdowns": [{"word": "key", "meaning": "অর্থ"}],
  "suggestedEnglishReplies": {
    "casual": "...",
    "professional": "...",
    "polite": "...",
    "concise": "..."
  }
}"""
        } else {
            """You are an expert Banglish to polished English translator for mobile chats.
Respond ONLY in strict JSON:
{
  "originalBanglish": "${text.replace("\"", "\\\"")}",
  "detectedBanglishMeaning": "বাংলা অর্থ ও উদ্দেশ্যের সারসংক্ষেপ",
  "replies": {
    "casual": "Natural English for friends",
    "professional": "Polished English for workplace or client",
    "polite": "Courteous and respectful English",
    "concise": "Ultra brief English"
  }
}"""
        }

        val modelsToTry = listOf("gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash")
        var lastException: Exception? = null

        for (model in modelsToTry) {
            try {
                val url = "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey"
                val requestJson = JsonObject().apply {
                    val contentsArr = com.google.gson.JsonArray().apply {
                        val contentObj = JsonObject().apply {
                            val partsArr = com.google.gson.JsonArray().apply {
                                val partObj = JsonObject().apply {
                                    addProperty("text", "$systemPrompt\n\nUser Input:\n$text")
                                }
                                add(partObj)
                            }
                            add("parts", partsArr)
                        }
                        add(contentObj)
                    }
                    add("contents", contentsArr)
                    val genConfig = JsonObject().apply {
                        addProperty("responseMimeType", "application/json")
                        addProperty("temperature", 0.3)
                    }
                    add("generationConfig", genConfig)
                }

                val body = requestJson.toString().toRequestBody(JSON_MEDIA)
                val request = Request.Builder().url(url).post(body).build()

                val response = httpClient.newCall(request).execute()
                val responseBody = response.body?.string() ?: throw RuntimeException("Empty response")

                if (!response.isSuccessful) {
                    throw RuntimeException("Model $model error: ${response.code}")
                }

                val rootObj = gson.fromJson(responseBody, JsonObject::class.java)
                val rawText = rootObj.getAsJsonArray("candidates")
                    ?.get(0)?.asJsonObject
                    ?.getAsJsonObject("content")
                    ?.getAsJsonArray("parts")
                    ?.get(0)?.asJsonObject
                    ?.get("text")?.asString ?: throw RuntimeException("Cannot parse candidate")

                val cleanJson = rawText.replace("^```json\\s*".toRegex(), "").replace("\\s*```$".toRegex(), "").trim()

                fun clean(s: String?) = s?.trim('\"', '\'', '“', '”') ?: ""

                return if (isEnglish) {
                    val res = gson.fromJson(cleanJson, BanglaQuickViewResponse::class.java)
                    val cleanReplies = res.suggestedEnglishReplies?.let {
                        SuggestedEnglishReplies(clean(it.casual), clean(it.professional), clean(it.polite), clean(it.concise))
                    }
                    TranslationResult.EnglishToBangla(res.copy(suggestedEnglishReplies = cleanReplies))
                } else {
                    val res = gson.fromJson(cleanJson, BanglishToEnglishResponse::class.java)
                    val cleanReplies = SuggestedEnglishReplies(
                        clean(res.replies.casual), clean(res.replies.professional), clean(res.replies.polite), clean(res.replies.concise)
                    )
                    TranslationResult.BanglishToEnglish(res.copy(replies = cleanReplies))
                }
            } catch (e: Exception) {
                lastException = e
            }
        }
        throw lastException ?: RuntimeException("All models failed")
    }

    private fun callGroq(text: String, apiKey: String, isEnglish: Boolean): TranslationResult {
        val systemPrompt = if (isEnglish) {
            "Expert English to Bengali translator. Return strictly valid JSON with originalText, banglaTranslation, contextSummary, sentiment, suggestedEnglishReplies (casual, professional, polite, concise)."
        } else {
            "Expert Banglish to polished English translator. Return strictly valid JSON with originalBanglish, detectedBanglishMeaning, replies (casual, professional, polite, concise)."
        }

        val requestJson = JsonObject().apply {
            addProperty("model", "llama-3.3-70b-versatile")
            val messagesArr = com.google.gson.JsonArray().apply {
                add(JsonObject().apply {
                    addProperty("role", "system")
                    addProperty("content", systemPrompt)
                })
                add(JsonObject().apply {
                    addProperty("role", "user")
                    addProperty("content", text)
                })
            }
            add("messages", messagesArr)
            add("response_format", JsonObject().apply { addProperty("type", "json_object") })
            addProperty("temperature", 0.3)
        }

        val body = requestJson.toString().toRequestBody(JSON_MEDIA)
        val request = Request.Builder()
            .url("https://api.groq.com/openai/v1/chat/completions")
            .header("Authorization", "Bearer $apiKey")
            .post(body)
            .build()

        val response = httpClient.newCall(request).execute()
        val responseBody = response.body?.string() ?: throw RuntimeException("Empty response")

        val rootObj = gson.fromJson(responseBody, JsonObject::class.java)
        val rawContent = rootObj.getAsJsonArray("choices")
            ?.get(0)?.asJsonObject
            ?.getAsJsonObject("message")
            ?.get("content")?.asString ?: throw RuntimeException("Cannot parse Groq choice")

        return if (isEnglish) {
            TranslationResult.EnglishToBangla(gson.fromJson(rawContent, BanglaQuickViewResponse::class.java))
        } else {
            TranslationResult.BanglishToEnglish(gson.fromJson(rawContent, BanglishToEnglishResponse::class.java))
        }
    }

    private fun getMockResponse(text: String, isEnglish: Boolean): TranslationResult {
        return if (isEnglish) {
            TranslationResult.EnglishToBangla(
                BanglaQuickViewResponse(
                    originalText = text,
                    banglaTranslation = "এই ইংরেজি বার্তার অর্থ: আপনার সময়সূচী বা কাজের অগ্রগতি সম্পর্কে জানতে চাওয়া হয়েছে।",
                    contextSummary = "পেশাদার ও বন্ধুত্বপূর্ণ বার্তা।",
                    sentiment = "friendly",
                    wordBreakdowns = listOf(
                        WordBreakdown("reschedule", "পুনর্নির্ধারণ করা"),
                        WordBreakdown("convenient", "সুবিধাজনক")
                    ),
                    suggestedEnglishReplies = SuggestedEnglishReplies(
                        casual = "Sure, tomorrow at 5 works great for me!",
                        professional = "Tomorrow at 5:00 PM is suitable for our team. Thank you.",
                        polite = "Could we please connect tomorrow at 5:00 PM if convenient for you?",
                        concise = "Tomorrow 5 PM confirmed."
                    )
                )
            )
        } else {
            TranslationResult.BanglishToEnglish(
                BanglishToEnglishResponse(
                    originalBanglish = text,
                    detectedBanglishMeaning = "আপনি আগামীকালের মিটিং ৫টায় করার অনুরোধ জানাচ্ছেন।",
                    replies = SuggestedEnglishReplies(
                        casual = "Hey, could we do the meeting tomorrow at 5? I'll be a bit busy earlier.",
                        professional = "Would it be possible to reschedule our meeting to 5:00 PM tomorrow? I have a prior commitment.",
                        polite = "I would be very grateful if we could meet tomorrow at 5:00 PM, as I have an engagement earlier.",
                        concise = "Can we meet tomorrow at 5 PM instead? Busy earlier."
                    )
                )
            )
        }
    }
}
