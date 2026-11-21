package com.bneng.assistant

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.bneng.assistant.ai.AiTranslatorClient
import com.bneng.assistant.ai.TranslationResult
import com.bneng.assistant.databinding.ActivityProcessTextBinding
import com.bneng.assistant.service.BnEngAccessibilityService
import com.bneng.assistant.utils.PrefManager
import kotlinx.coroutines.launch

class ProcessTextActivity : AppCompatActivity() {

    private lateinit var binding: ActivityProcessTextBinding
    private lateinit var prefs: PrefManager
    private var isReadOnly: Boolean = false
    private var originalSelectedText: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProcessTextBinding.inflate(layoutInflater)
        setContentView(binding.root)

        prefs = PrefManager(this)

        // Support BOTH ACTION_PROCESS_TEXT and ACTION_SEND (Share menu in Meta Business Suite / WhatsApp)
        originalSelectedText = when (intent.action) {
            Intent.ACTION_SEND -> intent.getStringExtra(Intent.EXTRA_TEXT)?.trim() ?: ""
            else -> intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT)?.toString()?.trim() ?: ""
        }
        isReadOnly = intent.getBooleanExtra(Intent.EXTRA_PROCESS_TEXT_READONLY, intent.action == Intent.ACTION_SEND)

        binding.btnClose.setOnClickListener { finish() }

        if (originalSelectedText.isBlank()) {
            Toast.makeText(this, "কোনো টেক্সট সিলেক্ট করা হয়নি", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        performProcessing()
    }

    private fun performProcessing() {
        binding.progressBar.visibility = View.VISIBLE
        binding.containerResult.visibility = View.GONE

        val (effectiveProvider, effectiveKey) = prefs.getEffectiveProviderAndKey()

        lifecycleScope.launch {
            val result = AiTranslatorClient.translateOrPolish(
                text = originalSelectedText,
                apiKey = effectiveKey,
                provider = effectiveProvider
            )

            binding.progressBar.visibility = View.GONE
            binding.containerResult.visibility = View.VISIBLE

            when (result) {
                is TranslationResult.EnglishToBangla -> {
                    val data = result.data
                    binding.tvHeaderLabel.text = "বাংলা অর্থ:"
                    binding.tvMainText.text = data.banglaTranslation
                    binding.tvOptionsLabel.text = "এই মেসেজের জবাবে ইংরেজি রিপ্লাই দিন:"

                    val replies = data.suggestedEnglishReplies
                    if (replies != null) {
                        setupReplyButton(binding.btnOptionCasual, "Casual: ${replies.casual}", replies.casual)
                        setupReplyButton(binding.btnOptionProfessional, "Professional: ${replies.professional}", replies.professional)
                        setupReplyButton(binding.btnOptionPolite, "Polite: ${replies.polite}", replies.polite)
                        setupReplyButton(binding.btnOptionConcise, "Short: ${replies.concise}", replies.concise)
                    } else {
                        binding.btnOptionCasual.visibility = View.GONE
                        binding.btnOptionProfessional.visibility = View.GONE
                        binding.btnOptionPolite.visibility = View.GONE
                        binding.btnOptionConcise.visibility = View.GONE
                    }
                }
                is TranslationResult.BanglishToEnglish -> {
                    val data = result.data
                    binding.tvHeaderLabel.text = "আপনার বাংলিশ এর সারসংক্ষেপ:"
                    binding.tvMainText.text = data.detectedBanglishMeaning
                    binding.tvOptionsLabel.text = "৪টি ভিন্ন টোনে রেডি ইংরেজি রিপ্লাই:"

                    val replies = data.replies
                    fun clean(s: String) = s.trim('\"', '\'', '“', '”')
                    setupReplyButton(binding.btnOptionCasual, "Casual: ${clean(replies.casual)}", clean(replies.casual))
                    setupReplyButton(binding.btnOptionProfessional, "Professional: ${clean(replies.professional)}", clean(replies.professional))
                    setupReplyButton(binding.btnOptionPolite, "Polite: ${clean(replies.polite)}", clean(replies.polite))
                    setupReplyButton(binding.btnOptionConcise, "Short: ${clean(replies.concise)}", clean(replies.concise))
                }
                is TranslationResult.Error -> {
                    binding.tvHeaderLabel.text = "⚠️ ত্রুটি:"
                    binding.tvMainText.text = result.message
                    binding.tvOptionsLabel.visibility = View.GONE
                    binding.btnOptionCasual.visibility = View.GONE
                    binding.btnOptionProfessional.visibility = View.GONE
                    binding.btnOptionPolite.visibility = View.GONE
                    binding.btnOptionConcise.visibility = View.GONE
                }
            }
        }
    }

    private fun setupReplyButton(
        button: com.google.android.material.button.MaterialButton,
        displayText: String,
        actualEnglishText: String
    ) {
        button.visibility = View.VISIBLE
        button.text = displayText
        button.setOnClickListener {
            // Always copy to clipboard so user can paste anywhere
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("English Reply", actualEnglishText)
            clipboard.setPrimaryClip(clip)

            var replaced = false

            // If triggered by native ACTION_PROCESS_TEXT from an editable field
            if (!isReadOnly) {
                val returnIntent = Intent().apply {
                    putExtra(Intent.EXTRA_PROCESS_TEXT, actualEnglishText)
                }
                setResult(Activity.RESULT_OK, returnIntent)
                replaced = true
            }

            finish()

            // Wait 180ms for host app to regain focus, then try accessibility replace if not already replaced
            if (!replaced) {
                val appContext = applicationContext
                Handler(Looper.getMainLooper()).postDelayed({
                    val accReplaced = BnEngAccessibilityService.instance?.replaceTextInActiveInput(actualEnglishText) ?: false
                    if (accReplaced) {
                        Toast.makeText(appContext, "✨ ইংরেজি রিপ্লেস ও কপি হয়েছে!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(appContext, "✅ ইংরেজি কপি হয়েছে (চ্যাট বক্সে পেস্ট করুন)", Toast.LENGTH_SHORT).show()
                    }
                }, 180)
            } else {
                Toast.makeText(applicationContext, "✨ ইংরেজি রিপ্লেস ও কপি হয়েছে!", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
