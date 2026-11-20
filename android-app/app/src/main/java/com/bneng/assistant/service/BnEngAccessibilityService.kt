package com.bneng.assistant.service

import android.accessibilityservice.AccessibilityService
import android.os.Bundle
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.Toast
import com.bneng.assistant.ai.AiTranslatorClient
import com.bneng.assistant.ai.TranslationResult
import com.bneng.assistant.utils.PrefManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class BnEngAccessibilityService : AccessibilityService() {

    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private lateinit var prefs: PrefManager

    override fun onCreate() {
        super.onCreate()
        prefs = PrefManager(this)
        instance = this
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Can monitor focused input in WhatsApp/Messenger if desired
    }

    override fun onInterrupt() {}

    /**
     * Replaces the currently focused input field with polished English text
     */
    fun polishAndReplaceCurrentInput() {
        val rootNode = rootInActiveWindow ?: return
        val focusedNode = rootNode.findFocus(AccessibilityNodeInfo.FOCUS_INPUT)

        if (focusedNode == null || !focusedNode.isEditable) {
            Toast.makeText(this, "চ্যাট বক্স ফোকাস করা নেই", Toast.LENGTH_SHORT).show()
            return
        }

        val rawText = focusedNode.text?.toString() ?: ""
        if (rawText.isBlank()) {
            Toast.makeText(this, "ইনপুট বক্সে কিছু লিখুন", Toast.LENGTH_SHORT).show()
            return
        }

        Toast.makeText(this, "AI ইংরেজি তৈরি করছে...", Toast.LENGTH_SHORT).show()

        serviceScope.launch {
            val result = withContext(Dispatchers.IO) {
                AiTranslatorClient.translateOrPolish(rawText, prefs.apiKey, prefs.provider)
            }

            val replacementText = when (result) {
                is TranslationResult.BanglishToEnglish -> result.data.replies.casual
                is TranslationResult.EnglishToBangla -> result.data.suggestedEnglishReplies?.casual ?: result.data.banglaTranslation
                is TranslationResult.Error -> null
            }

            if (!replacementText.isNullOrBlank()) {
                val arguments = Bundle().apply {
                    putCharSequence(
                        AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE,
                        replacementText
                    )
                }
                val success = focusedNode.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
                if (success) {
                    Toast.makeText(this@BnEngAccessibilityService, "✨ ইন-প্লেস রিপ্লেস সম্পন্ন!", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    companion object {
        var instance: BnEngAccessibilityService? = null
    }
}
