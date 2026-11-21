"use client";

import * as React from "react";
import {
  Sparkles,
  Smartphone,
  Layers,
  Download,
  Key,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Globe,
} from "lucide-react";
import { MobilePhoneFrame } from "@/components/simulator/MobilePhoneFrame";
import { StandaloneTranslator } from "@/components/dashboard/StandaloneTranslator";
import { ApkDownloadGuide } from "@/components/dashboard/ApkDownloadGuide";
import { ApiKeySettingsModal } from "@/components/dashboard/ApiKeySettingsModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { AIProvider } from "@/types/assistant.types";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [activeTab, setActiveTab] = React.useState<"simulator" | "translator" | "apk">("simulator");
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [geminiKey, setGeminiKey] = React.useState<string>("");
  const [groqKey, setGroqKey] = React.useState<string>("");
  const [provider, setProvider] = React.useState<AIProvider>("gemini");

  // Load saved credentials from localStorage
  React.useEffect(() => {
    try {
      const savedGemini = localStorage.getItem("bn_eng_gemini_key") || localStorage.getItem("bn_eng_api_key");
      const savedGroq = localStorage.getItem("bn_eng_groq_key");
      const savedProvider = localStorage.getItem("bn_eng_provider") as AIProvider;
      if (savedGemini) setGeminiKey(savedGemini);
      if (savedGroq) setGroqKey(savedGroq);
      if (savedProvider) setProvider(savedProvider);
    } catch (e) {
      console.warn("Could not read local storage:", e);
    }
  }, []);

  const handleSaveSettings = (newGeminiKey: string, newGroqKey: string, newProvider: AIProvider) => {
    setGeminiKey(newGeminiKey);
    setGroqKey(newGroqKey);
    setProvider(newProvider);
    try {
      localStorage.setItem("bn_eng_gemini_key", newGeminiKey);
      localStorage.setItem("bn_eng_groq_key", newGroqKey);
      localStorage.setItem("bn_eng_provider", newProvider);
    } catch (e) {
      console.warn("Could not save to local storage:", e);
    }
  };

  const activeApiKey = provider === "gemini" ? geminiKey : groqKey;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-foreground">
                  BN-ENG AI Assistant
                </h1>
                <Badge variant="default" className="text-[10px]">
                  v1.0 Pro
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                In-App Banglish to English & Bangla Quick View Translator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Active AI engine pill */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted text-xs text-foreground transition-colors"
            >
              <Cpu className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium capitalize">
                {activeApiKey ? provider : "No Key Set"}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="gap-1.5 text-xs rounded-xl"
            >
              <Key className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">API Key</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-muted/60 border border-border/80 shadow-xs">
            <button
              onClick={() => setActiveTab("simulator")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                activeTab === "simulator"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Smartphone className="h-4 w-4" />
              <span>📱 In-App Live Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab("translator")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                activeTab === "translator"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="h-4 w-4" />
              <span>⚡ Web Instant Translator</span>
            </button>

            <button
              onClick={() => setActiveTab("apk")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                activeTab === "apk"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Download className="h-4 w-4" />
              <span>📦 Android APK & Setup</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Live Interactive Phone Simulator */}
        {activeTab === "simulator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-2">
            {/* Left Column: Feature Highlights & Quick Test Guide */}
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-2">
                <Badge variant="accent">Zero App-Switching Mobile Assistant</Badge>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                  অন্য কোনো অ্যাপে না গিয়েই WhatsApp ও Messenger-এ সরাসরি কাজ করুন
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  ডানের মোবাইল স্ক্রিনে স্বয়ংক্রিয়ভাবে একটি লাইভ চ্যাট তৈরি করা আছে। নিচের দুটি চমৎকার ফিচার এখনই পরীক্ষা করুন:
                </p>
              </div>

              {/* Step by Step Interactive Cards */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      ১
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      English ➔ Bangla Quick View
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    ডানের স্ক্রিনে Alex-এর পাঠানো ইংরেজি মেসেজের ওপর ট্যাপ করুন। সাথে সাথে <strong className="text-primary font-semibold">✨ BN-ENG AI</strong> ভেসে উঠবে। ক্লিক করলেই চ্যাট স্ক্রিনের ওপরেই বাংলা অর্থ এবং ৩টি রেডি রিপ্লাই অপশন দেখতে পাবেন।
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">
                      ২
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      Banglish ➔ 1-Tap Auto Replace English
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    নিচের চ্যাট ইনপুটে বাংলিশ লিখুন (অথবা নমুনার যেকোনো একটিতে ক্লিক করুন), তারপর স্ক্রিনের ভাসমান <strong className="text-primary">✨</strong> বাটনে চাপ দিন। আপনার পছন্দের স্টাইল (Casual, Professional, Polite, Short) বেছে নিলে ১-ট্যাপে সরাসরি আপনার বাংলিশ মুছে সুন্দর ইংরেজি বসে যাবে!
                  </p>
                </div>
              </div>

              {/* Status & Tech Info */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    ইঞ্জিন: {activeApiKey ? (provider === "groq" ? "Groq AI (Llama-3.3)" : "Google Gemini") : "কোনো কী সেট করা নেই"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    রিয়েল-টাইম সাব-সেকেন্ড রেসপন্স স্পিড
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-xs"
                >
                  কী পরিবর্তন করুন
                </Button>
              </div>
            </div>

            {/* Right Column: Live Phone Mockup Frame */}
            <div className="lg:col-span-6 flex justify-center">
              <MobilePhoneFrame
                apiKey={activeApiKey}
                provider={provider}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Standalone Web Translator */}
        {activeTab === "translator" && (
          <StandaloneTranslator apiKey={activeApiKey} provider={provider} />
        )}

        {/* Tab 3: Android APK Download & CI/CD Guide */}
        {activeTab === "apk" && <ApkDownloadGuide />}
      </main>

      {/* Developer Credit Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-border/40 text-center">
        <p className="text-xs text-muted-foreground">
          Developed by <span className="font-semibold text-foreground">MH Parvej</span>
        </p>
      </footer>

      {/* API Key Modal */}
      <ApiKeySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        geminiKey={geminiKey}
        groqKey={groqKey}
        provider={provider}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
