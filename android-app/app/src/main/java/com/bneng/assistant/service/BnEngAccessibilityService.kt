package com.bneng.assistant.service

import android.accessibilityservice.AccessibilityService
import android.os.Bundle
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class BnEngAccessibilityService : AccessibilityService() {

    private var lastEditableNode: AccessibilityNodeInfo? = null
    var lastCapturedText: String = ""
        private set

    override fun onCreate() {
        super.onCreate()
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
            val txt = source.text?.toString()?.trim()
            if (!txt.isNullOrBlank()) {
                lastCapturedText = txt
            }
        }
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

    /**
     * Reads text currently typed inside the active WhatsApp / Business Suite / Messenger chat box.
     */
    fun getActiveInputText(): String {
        val editable = getFocusedOrEditableNode()
        val liveText = editable?.text?.toString()?.trim() ?: ""
        if (liveText.isNotBlank()) {
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
