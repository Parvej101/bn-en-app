package com.bneng.assistant.ai

import com.google.gson.annotations.SerializedName

data class WordBreakdown(
    @SerializedName("word") val word: String,
    @SerializedName("meaning") val meaning: String
)

data class SuggestedEnglishReplies(
    @SerializedName("casual") val casual: String,
    @SerializedName("professional") val professional: String,
    @SerializedName("polite") val polite: String,
    @SerializedName("concise") val concise: String
)

data class BanglaQuickViewResponse(
    @SerializedName("originalText") val originalText: String,
    @SerializedName("banglaTranslation") val banglaTranslation: String,
    @SerializedName("contextSummary") val contextSummary: String?,
    @SerializedName("sentiment") val sentiment: String?,
    @SerializedName("wordBreakdowns") val wordBreakdowns: List<WordBreakdown>?,
    @SerializedName("suggestedEnglishReplies") val suggestedEnglishReplies: SuggestedEnglishReplies?
)

data class BanglishToEnglishResponse(
    @SerializedName("originalBanglish") val originalBanglish: String,
    @SerializedName("detectedBanglishMeaning") val detectedBanglishMeaning: String,
    @SerializedName("replies") val replies: SuggestedEnglishReplies
)

sealed class TranslationResult {
    data class EnglishToBangla(val data: BanglaQuickViewResponse) : TranslationResult()
    data class BanglishToEnglish(val data: BanglishToEnglishResponse) : TranslationResult()
    data class Error(val message: String) : TranslationResult()
}
