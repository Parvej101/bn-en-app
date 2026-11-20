# 🇧🇩 ⇄ 🇬🇧 BN-ENG Mobile Assistant (Zero App-Switching)

> **কোনো অ্যাপ সুইচিং ছাড়াই WhatsApp ও Messenger-এর ভেতরেই সরাসরি ইংরেজি মেসেজের বাংলা অর্থ দেখুন এবং বাংলিশ লিখে ১-ট্যাপে রেডি ইংরেজি রিপ্লাই পাঠিয়ে দিন!**

---

## ✨ মূল সুবিধাসমূহ (Key Features)

1. **WhatsApp / Messenger থেকে বের হতে হবে না (Zero App-Switching):**
   - **ইংরেজি মেসেজ পড়ার সময়:** মেসেজে ট্যাপ/সিলেক্ট করলেই পপআপ মেনুতে `✨ BN-ENG AI` ভেসে উঠবে। ট্যাপ করলে চ্যাট স্ক্রিনের ওপরেই **সহজ বাংলা অর্থ**, কঠিন শব্দের মিনিং এবং ৩টি রেডি ইংরেজি রিপ্লাই কার্ড ভেসে উঠবে।
   - **বাংলিশ লিখে রিপ্লাই দেওয়ার সময়:** মেসেজ বক্সে বাংলিশ লিখুন (যেমন: *"bhai kal 5 tay meeting ta koren, ami busy thakbo"*), তারপর সিলেক্ট করে `✨ BN-ENG AI` চাপুন বা স্ক্রিনের ভাসমান `✨` বাটনে ট্যাপ করুন। ৪টি ভিন্ন টোনে (**Casual, Professional, Polite, Short**) সাজানো রিপ্লাই থেকে পছন্দেরটি বেছে নিলেই **সরাসরি আপনার চ্যাট বক্সে আপনার বাংলিশ লেখাটি মুছে গিয়ে সুন্দর ইংরেজি বসে যাবে** (কপি-পেস্টও করতে হবে না!)।

2. **ডুয়াল ফ্রি AI ইঞ্জিন (Dual Free AI Engine):**
   - **Google Gemini (`gemini-2.5-flash`):** দেশি বাংলিশ ভাষা, স্ল্যাং ও সাংস্কৃতিক ভাব অনুধাবনে অত্যন্ত দক্ষ।
   - **Groq (`llama-3.3-70b-versatile`):** মাত্র `0.3` সেকেন্ডে চোখের পলকে রিপ্লাই প্রস্তুত করে।
   - **স্মার্ট ডেমো অফলাইন মোড:** কোনো API কী ছাড়াও অবিলম্বে টেস্ট করার সুবিধা।

3. **রেডি ক্লাউড APK বিল্ডার (GitHub Actions CI/CD):**
   - আপনার পিসিতে অ্যান্ড্রয়েড স্টুডিও বা ১০ জিবি এসডিকে ছাড়াই সরাসরি গিটহাব ক্লাউড থেকে রেডি `.apk` ফাইল ডাউনলোড করা যায়।

4. **ইন্টারেক্টিভ মোবাইল সিমুলেটর (Next.js Live Simulator):**
   - ব্রাউজারেই সরাসরি অ্যান্ড্রয়েড ফোন ফ্রেম এবং WhatsApp ও Messenger-এর রিয়েল ইন্টারফেস চালিয়ে দেখতে পারবেন।

---

## 🏗️ আর্কিটেকচার ও টেকনোলজি স্ট্যাক (Architecture)

```text
BN-ENG/
├── android-app/                   # নেটিভ অ্যান্ড্রয়েড কোটলিন প্রজেক্ট (Native Android Kotlin App)
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml    # ACTION_PROCESS_TEXT, Floating Overlay ও Accessibility কনফিগারেশন
│   │   ├── java/com/bneng/assistant/
│   │   │   ├── MainActivity.kt    # সেটিংস, পারমিশন ও API Key ড্যাশবোর্ড
│   │   │   ├── ProcessTextActivity.kt # ইন-অ্যাপ ফ্লোটিং বটম-শিট ও ১-ট্যাপ রিপ্লেসমেন্ট ইঞ্জিন
│   │   │   ├── service/           # ফ্লোটিং বাটন ও এক্সেসিবিলিটি সার্ভিস
│   │   │   └── ai/                # Gemini ও Groq ক্লায়েন্ট
│   │   └── res/                   # লেআউট, কালার ও থিম রিসোর্স
│   └── build.gradle.kts           # গ্র্যাডল বিল্ড কনফিগারেশন
├── .github/workflows/
│   └── build-android-apk.yml      # ক্লাউডে অটোমেটিক APK তৈরি করার CI/CD পাইপলাইন
└── src/                           # Next.js App Router লাইভ মোবাইল সিমুলেটর ও ওয়েব অ্যাসিস্ট্যান্ট
    ├── app/                       # রুট পেজ ও API রাউট (/api/translate)
    ├── components/
    │   ├── simulator/             # লাইভ ফোন ফ্রেম ও চ্যাট অ্যাপ সিমুলেটর
    │   ├── dashboard/             # স্ট্যান্ডঅ্যালোন ট্রান্সলেটর ও APK গাইড
    │   └── ui/                    # রিইউজেবল বাটন, কার্ড, ব্যাজ ও ফ্লোটিং মোডাল
    └── lib/ai/                    # Gemini + Groq হাইব্রিড AI ইঞ্জিন
```

---

## 🚀 দ্রুত ব্যবহারের নিয়ম (Quick Start Guide)

### ১. লাইভ ওয়েব সিমুলেটর চালানো (Next.js Simulator)

প্রজেক্ট ডিরেক্টরিতে কমান্ড দিন:
```bash
npm install
npm run dev
```
তারপর আপনার ব্রাউজারে `http://localhost:3000` ওপেন করুন:
- **📱 WhatsApp / Messenger Live Simulator:** Alex-এর ইংরেজি মেসেজে ক্লিক করে বাংলা দেখুন, অথবা নিচে বাংলিশ লিখে ✨ বাটনে ট্যাপ করে ইন-প্লেস ইংরেজি রিপ্লেসমেন্ট পরীক্ষা করুন।
- **⚡ Web Instant Translator:** পিসিতে সরাসরি যেকোনো লেখা অনুবাদ ও ৪টি টোনে রিপ্লাই নেওয়ার জন্য ব্যবহার করুন।
- **📦 Android APK & Setup:** অ্যান্ড্রয়েড ফোনে অ্যাপটি ব্যবহারের গাইডলাইন।

---

### ২. অ্যান্ড্রয়েড ফোনে APK ইনস্টল করার নিয়ম (Cloud Auto-Build)

1. এই রিপোজিটরিটি আপনার GitHub অ্যাকাউন্টে পুশ করুন:
   ```bash
   git add .
   git commit -m "feat: complete BN-ENG Assistant with native Android and Next.js simulator"
   git push origin main
   ```
2. আপনার GitHub রিপোজিটরির **Actions** ট্যাবে যান।
3. **"Build Android APK"** স্বয়ংক্রিয়ভাবে রান হবে এবং বিল্ড শেষ হলে **Artifacts** থেকে `BN-ENG-Assistant-Debug-APK.zip` ডাউনলোড করুন।
4. আনজিপ করে আপনার অ্যান্ড্রয়েড ফোনে `.apk` ফাইলটি ইনস্টল করুন।
5. অ্যাপটি খুলে মাত্র ২টি পারমিশন অন করে দিন:
   - **Display over other apps** (যাতে WhatsApp/Messenger এর ওপরে ফ্লোটিং উইন্ডো ভেসে উঠতে পারে)
   - **Accessibility Service** (চ্যাট বক্সে সরাসরি ইংরেজি রিপ্লেস করার জন্য)
