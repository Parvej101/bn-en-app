package com.bneng.assistant.utils

import android.content.Context
import android.content.SharedPreferences

class PrefManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("bn_eng_assistant_prefs", Context.MODE_PRIVATE)

    var geminiApiKey: String
        get() = prefs.getString("gemini_api_key", prefs.getString("api_key", "")) ?: ""
        set(value) = prefs.edit().putString("gemini_api_key", value).apply()

    var groqApiKey: String
        get() = prefs.getString("groq_api_key", "") ?: ""
        set(value) = prefs.edit().putString("groq_api_key", value).apply()

    var provider: String
        get() = prefs.getString("provider", "gemini") ?: "gemini"
        set(value) = prefs.edit().putString("provider", value).apply()

    val apiKey: String
        get() = if (provider == "groq") groqApiKey else geminiApiKey

    fun getEffectiveProviderAndKey(): Pair<String, String> {
        val primaryKey = if (provider == "groq") groqApiKey.trim() else geminiApiKey.trim()
        if (primaryKey.isNotBlank()) return Pair(provider, primaryKey)
        // Auto-fallback to whichever provider has a saved key
        if (groqApiKey.trim().isNotBlank()) return Pair("groq", groqApiKey.trim())
        if (geminiApiKey.trim().isNotBlank()) return Pair("gemini", geminiApiKey.trim())
        return Pair(provider, "")
    }

    var isFloatingEnabled: Boolean
        get() = prefs.getBoolean("floating_enabled", false)
        set(value) = prefs.edit().putBoolean("floating_enabled", value).apply()
}
