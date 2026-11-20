package com.bneng.assistant

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.bneng.assistant.databinding.ActivityMainBinding
import com.bneng.assistant.service.FloatingOverlayService
import com.bneng.assistant.utils.PrefManager

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var prefs: PrefManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        prefs = PrefManager(this)

        setupUI()
        setupListeners()
    }

    private fun setupUI() {
        binding.etApiKey.setText(prefs.apiKey)
        if (prefs.provider == "groq") {
            binding.rbGroq.isChecked = true
        } else {
            binding.rbGemini.isChecked = true
        }
        binding.switchFloating.isChecked = prefs.isFloatingEnabled
    }

    private fun setupListeners() {
        // Save API Key
        binding.btnSaveApiKey.setOnClickListener {
            val key = binding.etApiKey.text?.toString()?.trim() ?: ""
            val provider = if (binding.rbGroq.isChecked) "groq" else "gemini"
            prefs.apiKey = key
            prefs.provider = provider
            Toast.makeText(this, "সেটিংস সফলভাবে সংরক্ষিত হয়েছে!", Toast.LENGTH_SHORT).show()
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
    }
}
