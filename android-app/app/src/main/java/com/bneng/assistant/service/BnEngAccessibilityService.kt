package com.bneng.assistant.service

import android.accessibilityservice.AccessibilityService
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.Toast
import com.bneng.assistant.ProcessTextActivity
import com.bneng.assistant.utils.PrefManager

class BnEngAccessibilityService : AccessibilityService() {

    private lateinit var prefs: PrefManager
    private var lastEditableNode: AccessibilityNodeInfo? = null
    var lastCapturedText: String = ""

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
        if (event == null) return
        val source = event.source ?: return

        if (source.isEditable) {
            lastEditableNode = source
            val txt = source.text?.toString()
            if (!txt.isNullOrBlank()) {
                lastCapturedText = txt
            }
        }
    }

    override fun onInterrupt() {}

    private fun findEditableNode(node: AccessibilityNodeInfo?): AccessibilityNodeInfo? {
        if (node == null) return null
        if (node.isEditable) return node
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            val found = findEditableNode(child)
            if (found != null) return found
        }
        return null
    }

    /**
     * Triggered when the user taps the floating button
     */
    fun onFloatingButtonClicked(context: Context) {
        val rootNode = rootInActiveWindow
        val editable = findEditableNode(rootNode) ?: lastEditableNode

        var targetText = editable?.text?.toString()?.trim() ?: ""

        // If input box is empty, check clipboard
        if (targetText.isBlank()) {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = clipboard.primaryClip
            if (clip != null && clip.itemCount > 0) {
                targetText = clip.getItemAt(0).text?.toString()?.trim() ?: ""
            }
        }

        if (targetText.isBlank()) {
            targetText = lastCapturedText
        }

        if (targetText.isBlank()) {
            Toast.makeText(this, "যেকোনো মেসেজ কপি করুন অথবা চ্যাট বক্সে কিছু লিখুন", Toast.LENGTH_SHORT).show()
            targetText = "Hello! Can I help you?"
        }

        // Open the floating translation dialog directly on screen!
        val intent = Intent(context, ProcessTextActivity::class.java).apply {
            action = Intent.ACTION_PROCESS_TEXT
            type = "text/plain"
            putExtra(Intent.EXTRA_PROCESS_TEXT, targetText)
            putExtra(Intent.EXTRA_PROCESS_TEXT_READONLY, editable == null)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        context.startActivity(intent)
    }

    fun replaceTextInActiveInput(newText: String): Boolean {
        val rootNode = rootInActiveWindow
        val editable = findEditableNode(rootNode) ?: lastEditableNode
        if (editable != null && editable.isEditable) {
            val arguments = Bundle().apply {
                putCharSequence(
                    AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE,
                    newText
                )
            }
            return editable.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
        }
        return false
    }

    companion object {
        var instance: BnEngAccessibilityService? = null
    }
}
