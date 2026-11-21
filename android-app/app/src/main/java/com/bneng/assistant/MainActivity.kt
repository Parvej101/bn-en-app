package com.bneng.assistant

import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.bneng.assistant.ai.AiTranslatorClient
import com.bneng.assistant.ai.TranslationResult
import com.bneng.assistant.databinding.ActivityMainBinding
import com.bneng.assistant.service.FloatingOverlayService
import com.bneng.assistant.utils.AppUpdater
import com.bneng.assistant.utils.PrefManager
import com.bneng.assistant.utils.UpdateInfo
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var prefs: PrefManager
    private var latestUpdateInfo: UpdateInfo? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        prefs = PrefManager(this)

        setupUI()
        setupListeners()
        checkForAppUpdate(silent = true)
    }

    private fun setupUI() {
        if (prefs.provider == "groq") {
            binding.rbGroq.isChecked = true
            binding.etApiKey.setText(prefs.groqApiKey)
        } else {
            binding.rbGemini.isChecked = true
            binding.etApiKey.setText(prefs.geminiApiKey)
        }
        binding.switchFloating.isChecked = prefs.isFloatingEnabled
        binding.tvAppVersion.text = "অ্যাপ ভার্সন: v${AppUpdater.getCurrentVersionName(this)}"
    }

    private fun setupListeners() {
        // Switch API key box automatically when changing provider
        binding.rgProvider.setOnCheckedChangeListener { _, checkedId ->
            if (checkedId == binding.rbGroq.id) {
                binding.etApiKey.setText(prefs.groqApiKey)
            } else {
                binding.etApiKey.setText(prefs.geminiApiKey)
            }
        }

        // Save API Key
        binding.btnSaveApiKey.setOnClickListener {
            val key = binding.etApiKey.text?.toString()?.trim() ?: ""
            val provider = if (binding.rbGroq.isChecked) "groq" else "gemini"
            if (provider == "groq") {
                prefs.groqApiKey = key
            } else {
                prefs.geminiApiKey = key
            }
            prefs.provider = provider
            Toast.makeText(this, "সেটিংস সফলভাবে সংরক্ষিত হয়েছে!", Toast.LENGTH_SHORT).show()
        }

        // Test API Key Connection
        binding.btnTestConnection.setOnClickListener {
            val key = binding.etApiKey.text?.toString()?.trim() ?: ""
            val provider = if (binding.rbGroq.isChecked) "groq" else "gemini"

            if (key.isBlank()) {
                AlertDialog.Builder(this)
                    .setTitle("API Key খালি")
                    .setMessage("অনুগ্রহ করে প্রথমে আপনার Gemini অথবা Groq API Key টি পেস্ট করুন।")
                    .setPositiveButton("ঠিক আছে", null)
                    .show()
                return@setOnClickListener
            }

            if (provider == "groq") {
                prefs.groqApiKey = key
            } else {
                prefs.geminiApiKey = key
            }
            prefs.provider = provider

            val progressDialog = AlertDialog.Builder(this)
                .setTitle("কানেকশন টেস্ট চলছে...")
                .setMessage("গুগল সার্ভারে টেস্ট রিকোয়েস্ট পাঠানো হচ্ছে...")
                .setCancelable(false)
                .create()
            progressDialog.show()

            lifecycleScope.launch {
                val result = AiTranslatorClient.translateOrPolish("hello", key, provider)
                progressDialog.dismiss()

                when (result) {
                    is TranslationResult.EnglishToBangla -> {
                        AlertDialog.Builder(this@MainActivity)
                            .setTitle("✅ কানেকশন সফল!")
                            .setMessage("অভিনন্দন! আপনার API Key গুগল সার্ভারের সাথে সফলভাবে কানেক্ট হয়েছে এবং কাজ করছে।")
                            .setPositiveButton("চমৎকার", null)
                            .show()
                    }
                    is TranslationResult.BanglishToEnglish -> {
                        AlertDialog.Builder(this@MainActivity)
                            .setTitle("✅ কানেকশন সফল!")
                            .setMessage("অভিনন্দন! আপনার API Key গুগল সার্ভারের সাথে সফলভাবে কানেক্ট হয়েছে এবং কাজ করছে।")
                            .setPositiveButton("চমৎকার", null)
                            .show()
                    }
                    is TranslationResult.Error -> {
                        AlertDialog.Builder(this@MainActivity)
                            .setTitle("❌ কানেকশন ব্যর্থ হয়েছে")
                            .setMessage("সমস্যা: ${result.message}\n\nঅনুগ্রহ করে নিশ্চিত করুন আপনার API Key টি সঠিক এবং ফোনে ইন্টারনেট সংযোগ চালু আছে।")
                            .setPositiveButton("আবার চেষ্টা করুন", null)
                            .show()
                    }
                }
            }
        }

        // Overlay Permission Button
        binding.btnOverlayPermission.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.canDrawOverlays(this)) {
                    val intent = Intent(
                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:$packageName")
                    )
                    startActivity(intent)
                } else {
                    Toast.makeText(this, "অনুমতি ইতিমধ্যে দেওয়া আছে", Toast.LENGTH_SHORT).show()
                }
            }
        }

        // Accessibility Permission Button
        binding.btnAccessibilityPermission.setOnClickListener {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            startActivity(intent)
        }

        // Floating switch
        binding.switchFloating.setOnCheckedChangeListener { _, isChecked ->
            prefs.isFloatingEnabled = isChecked
            if (isChecked) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                    Toast.makeText(this, "প্রথমে Overlay পারমিশন অন করুন", Toast.LENGTH_SHORT).show()
                    binding.switchFloating.isChecked = false
                    return@setOnCheckedChangeListener
                }
                startService(Intent(this, FloatingOverlayService::class.java))
            } else {
                stopService(Intent(this, FloatingOverlayService::class.java))
            }
        }

        // Manual Check Update button
        binding.btnCheckUpdate.setOnClickListener {
            checkForAppUpdate(silent = false)
        }

        // 1-Click Update Now Banner Button
        binding.btnUpdateNow.setOnClickListener {
            val info = latestUpdateInfo
            if (info != null) {
                startInAppUpdate(info)
            } else {
                checkForAppUpdate(silent = false)
            }
        }
    }

    private fun checkForAppUpdate(silent: Boolean) {
        if (!silent) {
            Toast.makeText(this, "আপডেট চেক করা হচ্ছে...", Toast.LENGTH_SHORT).show()
        }
        lifecycleScope.launch {
            val result = AppUpdater.checkForUpdate(this@MainActivity)
            result.onSuccess { info ->
                if (info.isUpdateAvailable) {
                    latestUpdateInfo = info
                    binding.cardUpdateBanner.visibility = View.VISIBLE
                    binding.tvUpdateTitle.text = "🚀 নতুন আপডেট এসেছে! (v${info.versionName})"
                    binding.tvUpdateNotes.text = info.releaseNotes

                    AlertDialog.Builder(this@MainActivity)
                        .setTitle("🚀 নতুন আপডেট পাওয়া গেছে (v${info.versionName})")
                        .setMessage("${info.releaseNotes}\n\nএখনই ১-ক্লিকে আপডেট করতে চান?")
                        .setPositiveButton("এখনই আপডেট করুন") { _, _ ->
                            startInAppUpdate(info)
                        }
                        .setNegativeButton("পরে করব", null)
                        .show()
                } else {
                    binding.cardUpdateBanner.visibility = View.GONE
                    if (!silent) {
                        Toast.makeText(
                            this@MainActivity,
                            "✅ আপনার অ্যাপটি সর্বশেষ ভার্সনে (v${AppUpdater.getCurrentVersionName(this@MainActivity)}) আছে!",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }.onFailure { err ->
                if (!silent) {
                    Toast.makeText(
                        this@MainActivity,
                        "আপডেট চেক ব্যর্থ: ${err.localizedMessage}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private fun startInAppUpdate(info: UpdateInfo) {
        if (!AppUpdater.canInstallPackages(this)) {
            AlertDialog.Builder(this)
                .setTitle("ইনস্টল পারমিশন প্রয়োজন")
                .setMessage("অ্যাপের ভেতর থেকে সরাসরি আপডেট ইনস্টল করার জন্য 'Allow from this source' অনুমতিটি একবার অন করে দিন।")
                .setPositiveButton("সেটিংসে যান") { _, _ ->
                    AppUpdater.openInstallPermissionSettings(this)
                }
                .setNegativeButton("বাতিল", null)
                .show()
            return
        }

        val downloadDialog = AlertDialog.Builder(this)
            .setTitle("⬇️ আপডেট ডাউনলোড হচ্ছে (v${info.versionName})")
            .setMessage("ডাউনলোড শুরু হচ্ছে... ০%")
            .setCancelable(false)
            .create()
        downloadDialog.show()

        lifecycleScope.launch {
            val res = AppUpdater.downloadAndInstallApk(this@MainActivity, info.apkUrl) { percent ->
                downloadDialog.setMessage("নতুন APK ডাউনলোড হচ্ছে... $percent%\nসম্পন্ন হলেই অটোমেটিক Update স্ক্রিন আসবে।")
            }
            downloadDialog.dismiss()
            res.onFailure { err ->
                AlertDialog.Builder(this@MainActivity)
                    .setTitle("❌ ডাউনলোড ব্যর্থ হয়েছে")
                    .setMessage("সমস্যা: ${err.localizedMessage}\n\nইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।")
                    .setPositiveButton("ঠিক আছে", null)
                    .show()
            }
        }
    }
}
