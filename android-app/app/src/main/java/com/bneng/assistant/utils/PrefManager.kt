package com.bneng.assistant.utils

import android.content.Context
import android.content.SharedPreferences

class PrefManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("bn_eng_assistant_prefs", Context.MODE_PRIVATE)

    var apiKey: String
        get() = prefs.getString("api_key", "") ?: ""
        set(value) = prefs.edit().putString("api_key", value).apply()

    var provider: String
        get() = prefs.getString("provider", "gemini") ?: "gemini"
        set(value) = prefs.edit().putString("provider", value).apply()

    var isFloatingEnabled: Boolean
        get() = prefs.getBoolean("floating_enabled", false)
        set(value) = prefs.edit().putBoolean("floating_enabled", value).apply()
}
