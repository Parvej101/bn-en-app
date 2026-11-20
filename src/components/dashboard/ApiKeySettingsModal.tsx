"use client";

import * as React from "react";
import { Key, Sparkles, X, Check, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AIProvider } from "@/types/assistant.types";

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  provider: AIProvider;
  onSave: (newKey: string, newProvider: AIProvider) => void;
}

export function ApiKeySettingsModal({
  isOpen,
  onClose,
  apiKey,
  provider,
  onSave,
}: ApiKeySettingsModalProps) {
  const [localKey, setLocalKey] = React.useState(apiKey);
  const [localProvider, setLocalProvider] = React.useState<AIProvider>(provider);
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    setLocalKey(apiKey);
    setLocalProvider(provider);
  }, [apiKey, provider, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localKey.trim(), localProvider);
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
                AI Engine & API Key Setup
              </h3>
              <p className="text-xs text-muted-foreground">
                ফ্রি Google Gemini অথবা Groq API Key যুক্ত করুন
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
          {/* Provider Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              পছন্দের AI ইঞ্জিন নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLocalProvider("gemini")}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  localProvider === "gemini"
                    ? "border-primary bg-primary/10 text-foreground"
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
                  gemini-2.5-flash (বাংলা ও বাংলিশ স্ল্যাং-এ সেরা)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLocalProvider("groq")}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  localProvider === "groq"
                    ? "border-primary bg-primary/10 text-foreground"
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
                  Llama-3.3-70B (~0.3s সুপার-ফাস্ট রিপ্লাই)
                </p>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                {localProvider === "gemini" ? "Gemini API Key" : "Groq API Key"}:
              </label>
              <a
                href={
                  localProvider === "gemini"
                    ? "https://aistudio.google.com/app/apikey"
                    : "https://console.groq.com/keys"
                }
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
              >
                ফ্রি কি (Key) নিন <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder={
                localProvider === "gemini"
                  ? "AIzaSy..."
                  : "gsk_..."
              }
              className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-primary" />
              কি (Key) টি শুধুমাত্র আপনার ব্রাউজারের লোকাল স্টোরেজে নিরাপদে সংরক্ষিত থাকে।
            </p>
          </div>

          {/* Note about Demo fallback */}
          <div className="rounded-xl bg-secondary/50 p-3 border border-border/60">
            <p className="text-xs text-muted-foreground leading-relaxed">
              💡 <strong>টিপস:</strong> কি (Key) খালি রাখলেও কোনো সমস্যা নেই — বিল্ট-ইন স্মার্ট অফলাইন ইঞ্জিন দিয়ে যেকোনো সময় ডেমো টেস্ট করতে পারবেন!
            </p>
          </div>
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
