package com.bneng.assistant.service

import android.accessibilityservice.AccessibilityService
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Build
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
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class BnEngAccessibilityService : AccessibilityService() {

    private lateinit var prefs: PrefManager
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    private var lastEditableNode: AccessibilityNodeInfo? = null
    var lastCapturedText: String = ""
        private set

    var lastSelectedMessageText: String = ""
        private set
    var lastSelectedMessageTime: Long = 0L
        private set

    private var isProcessingShortcut: Boolean = false
    private var lastShortcutTimestamp: Long = 0L

    private val chatPackages = setOf(
        "com.whatsapp",
        "com.whatsapp.w4b",
        "com.facebook.pages.app",
        "com.facebook.orca",
        "com.facebook.katana",
        "org.telegram.messenger"
    )

    private var lastAutoPopupTime: Long = 0L

    private val ignoredHintTexts = setOf(
        "message", "type a message", "ask meta ai or search", "aa",
        "write a message", "write a message...", "write a reply", "write a reply...",
        "search", "reply", "add a caption..."
    )

    private val ignoredUiLabels = setOf(
        "copy", "paste", "cut", "reply", "remove", "details", "pin", "report",
        "forward", "delete", "star", "send", "translate", "ask meta ai",
        "search", "more options", "back", "navigate up", "emoji", "attach"
    )

    override fun onCreate() {
        super.onCreate()
        prefs = PrefManager(this)
        instance = this
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        instance = null
    }

    private fun isSensitiveSecret(text: String): Boolean {
        val t = text.trim()
        if (t.isBlank()) return false
        val lower = t.lowercase()
        if (lower.startsWith("gsk_") ||
            lower.startsWith("aizasy") ||
            lower.startsWith("sk-") ||
            lower.startsWith("ghp_") ||
            lower.startsWith("gho_")
        ) return true
        return t.length >= 28 && !t.contains(" ") && !t.contains("\n") && !t.startsWith("http")
    }

    private fun cleanMetaBusinessMessage(raw: String): String {
        var text = raw.trim()
        val markerIdx = text.indexOf(", double tap to see sent/receive date and time", ignoreCase = true)
        if (markerIdx > 0) {
            text = text.substring(0, markerIdx).trim()
            // Strip leading sender name like "Nazmul, " or "Fluffy Touch Care, "
            val firstComma = text.indexOf(", ")
            if (firstComma in 1..35 && firstComma + 2 < text.length) {
                text = text.substring(firstComma + 2).trim()
            }
        }
        return text
    }

    /**
     * Scans the current Meta Business Suite / Messenger screen to find the latest visible message.
     */
    fun getLatestScreenMessage(): String {
        val root = rootInActiveWindow ?: return ""
        val pkg = root.packageName?.toString() ?: ""
        if (pkg != "com.facebook.pages.app" && pkg != "com.facebook.orca") return ""

        val messages = mutableListOf<String>()
        fun scan(n: AccessibilityNodeInfo?, depth: Int) {
            if (n == null || depth > 12) return
            val t = n.text?.toString()?.trim() ?: n.contentDescription?.toString()?.trim() ?: ""
            if (t.contains("double tap to see sent/receive date and time", ignoreCase = true)) {
                val cleaned = cleanMetaBusinessMessage(t)
                if (cleaned.length >= 3 && !isSensitiveSecret(cleaned)) {
                    messages.add(cleaned)
                }
            }
            for (i in 0 until n.childCount) {
                scan(n.getChild(i), depth + 1)
            }
        }
        scan(root, 0)
        return messages.lastOrNull() ?: ""
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        val source = event.source ?: return

        // Ignore events from our own app package or any password input field
        if (event.packageName?.toString() == packageName) return
        if (source.isPassword) return

        when (event.eventType) {
            AccessibilityEvent.TYPE_VIEW_CLICKED,
            AccessibilityEvent.TYPE_VIEW_LONG_CLICKED,
            AccessibilityEvent.TYPE_VIEW_SELECTED -> {
                if (!source.isEditable) {
                    var extracted = extractMeaningfulText(source)
                    if (extracted.isBlank()) {
                        val eventJoined = event.text?.joinToString(" ")?.trim() ?: ""
                        if (eventJoined.length >= 4 && !ignoredUiLabels.contains(eventJoined.lowercase())) {
                            extracted = eventJoined
                        }
                    }
                    if (extracted.isNotBlank()) {
                        val isMetaMessage = extracted.contains("double tap to see sent/receive date and time", ignoreCase = true)
                        val cleanedExtracted = cleanMetaBusinessMessage(extracted)
                        if (cleanedExtracted.isNotBlank() && !ignoredHintTexts.contains(cleanedExtracted.lowercase())) {
                            lastSelectedMessageText = cleanedExtracted
                            lastSelectedMessageTime = System.currentTimeMillis()

                            // In WhatsApp / Meta Business Suite / Messenger:
                            // Long-press OR tapping a Meta Business Suite message bubble opens Bangla popup directly!
                            val pkg = event.packageName?.toString() ?: ""
                            val now = System.currentTimeMillis()
                            val shouldAutoPopup = (event.eventType == AccessibilityEvent.TYPE_VIEW_LONG_CLICKED && chatPackages.contains(pkg)) ||
                                (isMetaMessage && (pkg == "com.facebook.pages.app" || pkg == "com.facebook.orca"))

                            if (shouldAutoPopup && cleanedExtracted.length >= 4 && now - lastAutoPopupTime > 1500L) {
                                lastAutoPopupTime = now
                                openPopupOnDemand(cleanedExtracted)
                            }
                        }
                    }
                } else {
                    lastEditableNode = source
                }
            }

            AccessibilityEvent.TYPE_VIEW_FOCUSED -> {
                if (source.isEditable) {
                    lastEditableNode = source
                }
            }

            AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED -> {
                if (source.isEditable && !source.isShowingHintText) {
                    lastEditableNode = source
                    val currentText = source.text?.toString() ?: ""
                    val trimmed = currentText.trim()
                    if (trimmed.isNotBlank() &&
                        !isSensitiveSecret(trimmed) &&
                        !ignoredHintTexts.contains(trimmed.lowercase())
                    ) {
                        lastCapturedText = trimmed
                    }
                    if (!isSensitiveSecret(trimmed) && !ignoredHintTexts.contains(trimmed.lowercase())) {
                        handleKeyboardShortcutIfPresent(source, currentText)
                    }
                }
            }
        }
    }

    private fun extractMeaningfulText(node: AccessibilityNodeInfo?): String {
        if (node == null) return ""
        val sb = StringBuilder()

        fun collect(n: AccessibilityNodeInfo?, depth: Int) {
            if (n == null || depth > 5) return
            val t = n.text?.toString()?.trim()
            if (!t.isNullOrBlank() && t.length >= 2) {
                val lower = t.lowercase()
                val isTimeOnly = Regex("^\\d{1,2}:\\d{2}(\\s?[ap]m)?$").matches(lower)
                if (!isTimeOnly && !ignoredUiLabels.contains(lower)) {
                    if (sb.isNotEmpty()) sb.append(" ")
                    sb.append(t)
                }
            }
            for (i in 0 until n.childCount) {
                collect(n.getChild(i), depth + 1)
            }
        }

        collect(node, 0)
        val result = sb.toString().trim()
        return if (result.length >= 3) result else ""
    }

    /**
     * Detects magic shortcuts typed inside Ridmik Keyboard (or any keyboard):
     * - "/e" at end => Instant English auto-replace inside the chat box!
     * - "/b" at end => Bangla meaning popup (for typed text or last tapped message)!
     * - "/p" at end => 4-tone English popup (Casual/Professional/Polite/Short)!
     */
    private fun handleKeyboardShortcutIfPresent(node: AccessibilityNodeInfo, rawText: String) {
        if (isProcessingShortcut) return
        val now = System.currentTimeMillis()
        if (now - lastShortcutTimestamp < 1200L) return

        val trimmed = rawText.trimEnd()
        val lower = trimmed.lowercase()

        when {
            lower.endsWith("/e") -> {
                val cleanInput = trimmed.dropLast(2).trim()
                if (cleanInput.isBlank()) return
                lastShortcutTimestamp = now
                isProcessingShortcut = true
                runInstantEnglishReplace(node, cleanInput)
            }
            lower.endsWith("/f") -> {
                val cleanInput = trimmed.dropLast(2).trim()
                lastShortcutTimestamp = now
                setNodeText(node, cleanInput)
                summonFloatingBubbleOnDemand()
            }
            lower.endsWith("/b") -> {
                val cleanInput = trimmed.dropLast(2).trim()
                lastShortcutTimestamp = now
                setNodeText(node, cleanInput)
                val target = if (cleanInput.isNotBlank()) cleanInput else getRecentSelectedMessage()
                openPopupOnDemand(target)
            }
            lower.endsWith("/p") -> {
                val cleanInput = trimmed.dropLast(2).trim()
                if (cleanInput.isBlank()) return
                lastShortcutTimestamp = now
                setNodeText(node, cleanInput)
                openPopupOnDemand(cleanInput)
            }
        }
    }

    private fun summonFloatingBubbleOnDemand() {
        val existing = FloatingOverlayService.instance
        if (existing != null) {
            existing.showFloatingBubble()
        } else {
            val intent = Intent(this, FloatingOverlayService::class.java).apply {
                action = FloatingOverlayService.ACTION_SHOW_BUBBLE
            }
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForegroundService(intent)
                } else {
                    startService(intent)
                }
            } catch (_: Throwable) {}
        }
    }

    private fun openPopupOnDemand(targetText: String) {
        val existing = FloatingOverlayService.instance
        if (existing != null) {
            existing.openWithText(targetText)
        } else {
            val intent = Intent(this, FloatingOverlayService::class.java).apply {
                action = FloatingOverlayService.ACTION_OPEN_POPUP
                putExtra(FloatingOverlayService.EXTRA_TEXT, targetText)
            }
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForegroundService(intent)
                } else {
                    startService(intent)
                }
            } catch (_: Throwable) {}
        }
    }

    private fun runInstantEnglishReplace(node: AccessibilityNodeInfo, banglishText: String) {
        val (provider, apiKey) = prefs.getEffectiveProviderAndKey()
        if (apiKey.isBlank()) {
            isProcessingShortcut = false
            Toast.makeText(this, "⚠️ API Key সেভ করা নেই! BN-ENG অ্যাপে Key দিন।", Toast.LENGTH_LONG).show()
            return
        }

        // Remove "/e" visually while translating
        setNodeText(node, banglishText)
        Toast.makeText(this, "✨ ইংরেজি করা হচ্ছে...", Toast.LENGTH_SHORT).show()

        serviceScope.launch {
            try {
                val result = AiTranslatorClient.translateOrPolish(banglishText, apiKey, provider)
                val finalEnglish = when (result) {
                    is TranslationResult.BanglishToEnglish -> {
                        val r = result.data.replies
                        (r.casual.ifBlank { r.professional }).trim('\"', '\'', '“', '”')
                    }
                    is TranslationResult.EnglishToBangla -> {
                        val r = result.data.suggestedEnglishReplies
                        (r?.casual ?: result.data.banglaTranslation).trim('\"', '\'', '“', '”')
                    }
                    is TranslationResult.Error -> {
                        Toast.makeText(this@BnEngAccessibilityService, "⚠️ ${result.message}", Toast.LENGTH_LONG).show()
                        ""
                    }
                }

                if (finalEnglish.isNotBlank()) {
                    val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    clipboard.setPrimaryClip(ClipData.newPlainText("BN-ENG English", finalEnglish))

                    val replaced = replaceTextInActiveInput(finalEnglish) || setNodeText(node, finalEnglish)
                    if (replaced) {
                        Toast.makeText(this@BnEngAccessibilityService, "✅ ইংরেজি হয়ে গেছে!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@BnEngAccessibilityService, "✅ কপি হয়েছে, পেস্ট করুন", Toast.LENGTH_SHORT).show()
                    }
                }
            } finally {
                isProcessingShortcut = false
            }
        }
    }

    private fun setNodeText(node: AccessibilityNodeInfo?, newText: String): Boolean {
        if (node == null || !node.isEditable) return false
        val arguments = Bundle().apply {
            putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, newText)
        }
        return node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
    }

    override fun onInterrupt() {}

    private fun findEditableNode(node: AccessibilityNodeInfo?): AccessibilityNodeInfo? {
        if (node == null) return null
        if (node.isEditable && node.isVisibleToUser) return node
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            val found = findEditableNode(child)
            if (found != null) return found
        }
        return null
    }

    private fun getFocusedOrEditableNode(): AccessibilityNodeInfo? {
        val rootNode = rootInActiveWindow
        val focused = rootNode?.findFocus(AccessibilityNodeInfo.FOCUS_INPUT)
        if (focused != null && focused.isEditable) {
            return focused
        }
        val editableInTree = findEditableNode(rootNode)
        if (editableInTree != null) {
            return editableInTree
        }
        return lastEditableNode
    }

    fun getRecentSelectedMessage(): String {
        val ageMs = System.currentTimeMillis() - lastSelectedMessageTime
        return if (lastSelectedMessageText.isNotBlank() && ageMs < 90_000L) {
            lastSelectedMessageText
        } else {
            ""
        }
    }

    /**
     * Reads text currently typed inside the active WhatsApp / Business Suite / Messenger chat box.
     */
    fun getActiveInputText(): String {
        val editable = getFocusedOrEditableNode()
        if (editable == null || editable.isPassword || editable.isShowingHintText) return ""
        val liveText = editable.text?.toString()?.trim() ?: ""
        if (liveText.isNotBlank() &&
            !isSensitiveSecret(liveText) &&
            !ignoredHintTexts.contains(liveText.lowercase())
        ) {
            lastCapturedText = liveText
            return liveText
        }
        return ""
    }

    /**
     * Replaces text directly inside the active chat box (WhatsApp, Meta Business Suite, Messenger).
     */
    fun replaceTextInActiveInput(newText: String): Boolean {
        val editable = getFocusedOrEditableNode()
        return setNodeText(editable, newText)
    }

    companion object {
        var instance: BnEngAccessibilityService? = null
    }
}
