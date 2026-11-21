package com.bneng.assistant.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.WindowManager
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.core.app.NotificationCompat
import com.bneng.assistant.R
import com.bneng.assistant.ai.AiTranslatorClient
import com.bneng.assistant.ai.TranslationResult
import com.bneng.assistant.utils.PrefManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlin.math.abs

class FloatingOverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var floatingView: View? = null
    private var popupOverlayView: View? = null
    private lateinit var prefs: PrefManager
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        instance = this
        prefs = PrefManager(this)
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        startAsForeground()
        setupFloatingBubble()
    }

    fun openWithText(explicitText: String?) {
        mainHandler.post {
            hideTranslatorOverlay()
            showTranslatorOverlay(explicitText)
        }
    }

    private fun startAsForeground() {
        val channelId = "bn_eng_floating_service"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "BN-ENG Floating Assistant",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }

        val notification: Notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("BN-ENG AI Assistant চালু আছে")
            .setContentText("ভাসমান বাটন ট্যাপ করে যেকোনো সময় অনুবাদ করুন")
            .setSmallIcon(android.R.drawable.ic_menu_edit)
            .build()

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                startForeground(
                    1001,
                    notification,
                    android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
                )
            } else {
                startForeground(1001, notification)
            }
        } catch (_: Throwable) {
            try {
                startForeground(1001, notification)
            } catch (_: Throwable) {}
        }
    }

    private fun getOverlayLayoutType(): Int {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }
    }

    private fun setupFloatingBubble() {
        val inflater = LayoutInflater.from(this)
        floatingView = inflater.inflate(R.layout.floating_bubble, null)

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            getOverlayLayoutType(),
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 40
            y = 320
        }

        val touchSlop = maxOf(ViewConfiguration.get(this).scaledTouchSlop, 30)

        floatingView?.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f
            private var isClick = true

            override fun onTouch(v: View?, event: MotionEvent?): Boolean {
                if (event == null) return false
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        isClick = true
                        v?.animate()?.scaleX(0.9f)?.scaleY(0.9f)?.setDuration(80)?.start()
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val dx = (event.rawX - initialTouchX).toInt()
                        val dy = (event.rawY - initialTouchY).toInt()
                        if (abs(dx) > touchSlop || abs(dy) > touchSlop) {
                            isClick = false
                        }
                        if (!isClick) {
                            params.x = initialX + dx
                            params.y = initialY + dy
                            windowManager?.updateViewLayout(floatingView, params)
                        }
                        return true
                    }
                    MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                        v?.animate()?.scaleX(1f)?.scaleY(1f)?.setDuration(80)?.start()
                        if (event.action == MotionEvent.ACTION_UP && isClick) {
                            // Open overlay translator directly inside WindowManager (never blocked by MIUI/Android 10+!)
                            toggleTranslatorOverlay()
                        }
                        return true
                    }
                }
                return false
            }
        })

        windowManager?.addView(floatingView, params)
    }

    private fun toggleTranslatorOverlay() {
        if (popupOverlayView != null) {
            hideTranslatorOverlay()
        } else {
            showTranslatorOverlay()
        }
    }

    private fun hideTranslatorOverlay() {
        popupOverlayView?.let { view ->
            try {
                windowManager?.removeView(view)
            } catch (_: Exception) {}
            popupOverlayView = null
        }
    }

    private fun readClipboardText(): String {
        return try {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = clipboard.primaryClip
            if (clip != null && clip.itemCount > 0) {
                clip.getItemAt(0).coerceToText(this)?.toString()?.trim() ?: ""
            } else {
                ""
            }
        } catch (_: Exception) {
            ""
        }
    }

    private fun showTranslatorOverlay(explicitText: String? = null) {
        try {
            showTranslatorOverlayInternal(explicitText)
        } catch (e: Throwable) {
            Toast.makeText(this, "ওভারলে ত্রুটি: ${e.javaClass.simpleName}: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
        }
    }

    private fun showTranslatorOverlayInternal(explicitText: String? = null) {
        // Capture active input box text & recently tapped message BEFORE opening our overlay window
        val activeInputText = BnEngAccessibilityService.instance?.getActiveInputText() ?: ""
        val tappedMessageText = BnEngAccessibilityService.instance?.getRecentSelectedMessage() ?: ""

        val inflater = LayoutInflater.from(this)
        val view = inflater.inflate(R.layout.overlay_translator_sheet, null)

        val overlayParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            getOverlayLayoutType(),
            WindowManager.LayoutParams.FLAG_DIM_BEHIND,
            PixelFormat.TRANSLUCENT
        ).apply {
            dimAmount = 0.45f
            gravity = Gravity.CENTER
            softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
        }

        val backdrop = view.findViewById<FrameLayout>(R.id.overlayBackdrop)
        val btnClose = view.findViewById<TextView>(R.id.btnOverlayClose)
        val tvProviderBadge = view.findViewById<TextView>(R.id.tvProviderBadge)
        val etInput = view.findViewById<EditText>(R.id.etOverlayInput)
        val btnPaste = view.findViewById<TextView>(R.id.btnOverlayPaste)
        val btnTranslate = view.findViewById<TextView>(R.id.btnOverlayTranslate)
        val layoutLoading = view.findViewById<LinearLayout>(R.id.layoutOverlayLoading)
        val tvError = view.findViewById<TextView>(R.id.tvOverlayError)
        val scrollResult = view.findViewById<ScrollView>(R.id.scrollOverlayResult)
        val tvHeaderLabel = view.findViewById<TextView>(R.id.tvOverlayHeaderLabel)
        val tvMeaning = view.findViewById<TextView>(R.id.tvOverlayMeaning)
        val tvRepliesLabel = view.findViewById<TextView>(R.id.tvOverlayRepliesLabel)
        val btnCasual = view.findViewById<TextView>(R.id.btnOverlayCasual)
        val btnProfessional = view.findViewById<TextView>(R.id.btnOverlayProfessional)
        val btnPolite = view.findViewById<TextView>(R.id.btnOverlayPolite)
        val btnConcise = view.findViewById<TextView>(R.id.btnOverlayConcise)

        val (effectiveProvider, effectiveKey) = prefs.getEffectiveProviderAndKey()
        tvProviderBadge.text = if (effectiveProvider == "groq") "Groq AI" else "Gemini AI"

        backdrop.setOnClickListener { hideTranslatorOverlay() }
        btnClose.setOnClickListener { hideTranslatorOverlay() }

        fun setupReplyCard(card: TextView, label: String, replyText: String) {
            val cleanText = replyText.trim('\"', '\'', '“', '”')
            if (cleanText.isBlank()) {
                card.visibility = View.GONE
                return
            }
            card.visibility = View.VISIBLE
            card.text = "$label\n$cleanText"
            card.setOnClickListener {
                // 1. Copy clean English text to clipboard
                val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                clipboard.setPrimaryClip(ClipData.newPlainText("BN-ENG Reply", cleanText))

                // 2. Close overlay FIRST so WhatsApp / Meta Business Suite regains window focus!
                hideTranslatorOverlay()

                // 3. Wait 180ms and auto-replace text in the chat box via AccessibilityService
                mainHandler.postDelayed({
                    val replaced = BnEngAccessibilityService.instance?.replaceTextInActiveInput(cleanText) ?: false
                    if (replaced) {
                        Toast.makeText(this@FloatingOverlayService, "✨ ইংরেজি রিপ্লেস ও কপি হয়েছে!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@FloatingOverlayService, "✅ কপি হয়েছে! চ্যাট বক্সে পেস্ট করুন", Toast.LENGTH_SHORT).show()
                    }
                }, 180)
            }
        }

        fun runTranslation(textToTranslate: String) {
            val trimmed = textToTranslate.trim()
            if (trimmed.isBlank()) {
                tvError.visibility = View.VISIBLE
                tvError.text = "অনুবাদ করার জন্য কোনো টেক্সট পাওয়া যায়নি। মেসেজ কপি করে '📋 পেস্ট করুন' চাপুন অথবা ওপরে লিখুন।"
                return
            }

            val (prov, key) = prefs.getEffectiveProviderAndKey()
            tvProviderBadge.text = if (prov == "groq") "Groq AI" else "Gemini AI"

            layoutLoading.visibility = View.VISIBLE
            tvError.visibility = View.GONE
            scrollResult.visibility = View.GONE

            serviceScope.launch {
                val result = AiTranslatorClient.translateOrPolish(trimmed, key, prov)
                layoutLoading.visibility = View.GONE

                when (result) {
                    is TranslationResult.EnglishToBangla -> {
                        val data = result.data
                        scrollResult.visibility = View.VISIBLE
                        tvHeaderLabel.text = "বাংলা অর্থ:"
                        tvMeaning.text = data.banglaTranslation
                        tvRepliesLabel.text = "এই মেসেজের জবাবে রেডি ইংরেজি রিপ্লাই (ট্যাপ করুন):"

                        val replies = data.suggestedEnglishReplies
                        if (replies != null) {
                            setupReplyCard(btnCasual, "💬 Casual:", replies.casual)
                            setupReplyCard(btnProfessional, "💼 Professional:", replies.professional)
                            setupReplyCard(btnPolite, "🙏 Polite:", replies.polite)
                            setupReplyCard(btnConcise, "⚡ Short:", replies.concise)
                        } else {
                            btnCasual.visibility = View.GONE
                            btnProfessional.visibility = View.GONE
                            btnPolite.visibility = View.GONE
                            btnConcise.visibility = View.GONE
                        }
                    }
                    is TranslationResult.BanglishToEnglish -> {
                        val data = result.data
                        scrollResult.visibility = View.VISIBLE
                        tvHeaderLabel.text = "আপনার বাংলিশ এর সারসংক্ষেপ:"
                        tvMeaning.text = data.detectedBanglishMeaning
                        tvRepliesLabel.text = "পছন্দের ইংরেজি রিপ্লাই ট্যাপ করুন (অটো রিপ্লেস হবে):"

                        val replies = data.replies
                        setupReplyCard(btnCasual, "💬 Casual:", replies.casual)
                        setupReplyCard(btnProfessional, "💼 Professional:", replies.professional)
                        setupReplyCard(btnPolite, "🙏 Polite:", replies.polite)
                        setupReplyCard(btnConcise, "⚡ Short:", replies.concise)
                    }
                    is TranslationResult.Error -> {
                        tvError.visibility = View.VISIBLE
                        tvError.text = "⚠️ ${result.message}"
                    }
                }
            }
        }

        btnPaste.setOnClickListener {
            val clipText = readClipboardText()
            if (clipText.isNotBlank()) {
                etInput.setText(clipText)
                etInput.setSelection(clipText.length)
                runTranslation(clipText)
            } else {
                Toast.makeText(this, "ক্লিপবোর্ডে কোনো টেক্সট কপি করা নেই", Toast.LENGTH_SHORT).show()
            }
        }

        btnTranslate.setOnClickListener {
            runTranslation(etInput.text?.toString() ?: "")
        }

        popupOverlayView = view
        windowManager?.addView(view, overlayParams)

        // Once the overlay window has focus, pick best available text and auto-translate!
        view.postDelayed({
            val initialText = when {
                !explicitText.isNullOrBlank() -> explicitText.trim()
                activeInputText.isNotBlank() -> activeInputText
                tappedMessageText.isNotBlank() -> tappedMessageText
                else -> {
                    val clip = readClipboardText()
                    if (clip.isNotBlank()) clip else BnEngAccessibilityService.instance?.lastCapturedText ?: ""
                }
            }
            if (initialText.isNotBlank()) {
                etInput.setText(initialText)
                etInput.setSelection(initialText.length)
                runTranslation(initialText)
            }
        }, 120)
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
        serviceScope.cancel()
        hideTranslatorOverlay()
        if (floatingView != null) {
            try {
                windowManager?.removeView(floatingView)
            } catch (_: Exception) {}
            floatingView = null
        }
    }

    companion object {
        var instance: FloatingOverlayService? = null
    }
}
