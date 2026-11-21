"use client";

import * as React from "react";
import {
  Key,
  Sparkles,
  X,
  Check,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AIProvider } from "@/types/assistant.types";

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  groqKey: string;
  provider: AIProvider;
  onSave: (geminiKey: string, groqKey: string, provider: AIProvider) => void;
}

export function ApiKeySettingsModal({
  isOpen,
  onClose,
  geminiKey,
  groqKey,
  provider,
  onSave,
}: ApiKeySettingsModalProps) {
  const [currentProvider, setCurrentProvider] = React.useState<AIProvider>(provider);
  const [localGeminiKey, setLocalGeminiKey] = React.useState(geminiKey);
  const [localGroqKey, setLocalGroqKey] = React.useState(groqKey);
  const [isSaved, setIsSaved] = React.useState(false);

  // Test Connection state
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    setLocalGeminiKey(geminiKey);
    setLocalGroqKey(groqKey);
    setCurrentProvider(provider);
    setTestResult(null);
  }, [geminiKey, groqKey, provider, isOpen]);

  if (!isOpen) return null;

  const currentActiveKey = currentProvider === "gemini" ? localGeminiKey : localGroqKey;

  const handleTestConnection = async () => {
    if (!currentActiveKey.trim()) {
      setTestResult({
        success: false,
        message: `অনুগ্রহ করে প্রথমে আপনার ${
          currentProvider === "gemini" ? "Google Gemini" : "Groq"
        } API Key টি পেস্ট করুন।`,
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: currentActiveKey.trim(),
          provider: currentProvider,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || "কানেকশন সফল হয়েছে!",
        });
        // Auto-save on successful test
        onSave(localGeminiKey.trim(), localGroqKey.trim(), currentProvider);
      } else {
        setTestResult({
          success: false,
          message: data.error || "কানেকশন ব্যর্থ হয়েছে।",
        });
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: `নেটওয়ার্ক সমস্যা: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSave(localGeminiKey.trim(), localGroqKey.trim(), currentProvider);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                AI Engine &amp; API Key Setup
              </h3>
              <p className="text-xs text-muted-foreground">
                আপনার ফ্রি Google Gemini অথবা Groq API Key যুক্ত করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 py-4">
          {/* Provider Selection Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              কোন ইঞ্জিনটি ব্যবহার করতে চান?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentProvider("gemini");
                  setTestResult(null);
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  currentProvider === "gemini"
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Google Gemini
                  </span>
                  <Badge variant="success" className="text-[9px] px-1 py-0">
                    Free
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  বাংলা ও বাংলিশ স্ল্যাং-এ সেরা
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentProvider("groq");
                  setTestResult(null);
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  currentProvider === "groq"
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Groq AI</span>
                  <Badge variant="accent" className="text-[9px] px-1 py-0">
                    Fastest
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Llama-3.3 (~0.3s সুপার ফাস্ট)
                </p>
              </button>
            </div>
          </div>

          {/* Gemini Input (when Gemini is active) */}
          {currentProvider === "gemini" && (
            <div className="space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Google Gemini API Key:
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                >
                  ফ্রি Gemini Key নিন <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <input
                type="password"
                value={localGeminiKey}
                onChange={(e) => {
                  setLocalGeminiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          )}

          {/* Groq Input (when Groq is active) */}
          {currentProvider === "groq" && (
            <div className="space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Groq AI API Key:
                </label>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                >
                  ফ্রি Groq Key নিন <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <input
                type="password"
                value={localGroqKey}
                onChange={(e) => {
                  setLocalGroqKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="gsk_..."
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          )}

          {/* Test Connection Button */}
          <div className="pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="w-full h-9 text-xs rounded-xl gap-2 border-primary/40 text-primary hover:bg-primary/10"
            >
              {isTesting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {isTesting
                ? "কানেকশন যাচাই করা হচ্ছে..."
                : `⚡ ${currentProvider === "gemini" ? "Gemini" : "Groq"} কানেকশন টেস্ট করুন`}
            </Button>
          </div>

          {/* Test Status Result Alert */}
          {testResult && (
            <div
              className={`p-3 rounded-2xl border text-xs leading-relaxed animate-in fade-in ${
                testResult.success
                  ? "bg-primary/10 border-primary/40 text-foreground"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-xs">
                    {testResult.success ? "কানেকশন সফল!" : "কানেকশন ব্যর্থ!"}
                  </p>
                  <p className="text-[11px] mt-0.5 opacity-90">
                    {testResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-primary" />
            কি (Key) টি শুধুমাত্র আপনার নিজস্ব ব্রাউজারের লোকাল স্টোরেজে নিরাপদে সংরক্ষিত থাকে।
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button variant="ghost" size="sm" onClick={onClose}>
            বাতিল
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} className="gap-1.5">
            {isSaved ? <Check className="h-3.5 w-3.5" /> : null}
            {isSaved ? "সংরক্ষিত!" : "সংরক্ষণ করুন"}
          </Button>
        </div>
      </div>
    </div>
  );
}
