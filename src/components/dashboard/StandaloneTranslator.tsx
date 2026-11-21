"use client";

import * as React from "react";
import {
  Sparkles,
  ArrowRightLeft,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  MessageSquare,
  Cpu,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import {
  TranslationApiResponse,
  AIProvider,
  ReplyTone,
} from "@/types/assistant.types";

interface StandaloneTranslatorProps {
  apiKey: string;
  provider: AIProvider;
}

export function StandaloneTranslator({
  apiKey,
  provider,
}: StandaloneTranslatorProps) {
  const [inputText, setInputText] = React.useState(
    "vai kal bikel 5 tay meeting e ashen, client presentation ready thakbe"
  );
  const [result, setResult] = React.useState<TranslationApiResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          provider,
          apiKey,
        }),
      });
      const data: TranslationApiResponse = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Direct translation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const stripQuotes = (t: string) => t.replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(stripQuotes(text));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Input Card */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              ইনপুট বক্স (English বা Banglish)
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Auto Detect
            </Badge>
          </div>
          <CardDescription>
            যেকোনো ইংরেজি মেসেজ পেস্ট করুন বাংলা অর্থ দেখতে, অথবা বাংলিশ লিখুন ইংরেজি রিপ্লাই পেতে।
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={6}
            placeholder="এখানে ইংরেজি মেসেজ অথবা বাংলিশ লিখুন..."
            className="w-full flex-1 rounded-2xl border border-border bg-muted/30 p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
          />

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-muted-foreground self-center mr-1">
              নমুনা:
            </span>
            {[
              "Can we schedule a sync tomorrow at 3 PM to review the proposal?",
              "bhai invoice er taka ta ektu taratari pathale valo hoto",
              "amra kaj ta shuru korechi kal update janabo",
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(chip)}
                className="text-[10px] bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 rounded-full border border-border/60 transition-colors"
              >
                {chip.slice(0, 32)}...
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setInputText("");
                setResult(null);
              }}
              className="text-xs text-muted-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              মুছে ফেলুন
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={isLoading}
              onClick={handleTranslate}
              className="gap-2 font-semibold shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              অনুবাদ ও রিপ্লাই তৈরি করুন
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output / Result Card */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
              ফলাফল ও AI বিশ্লেষণ
            </CardTitle>
            {result?.providerUsed && (
              <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                <Cpu className="h-2.5 w-2.5" />
                {result.providerUsed}
              </Badge>
            )}
          </div>
          <CardDescription>
            {result?.mode === "english_to_bangla"
              ? "ইংরেজি মেসেজের বাংলা অনুবাদ ও পাল্টা রিপ্লাই"
              : result?.mode === "banglish_to_english"
              ? "বাংলিশ থেকে ৪টি ভিন্ন টোনে সাজানো ইংরেজি রিপ্লাই"
              : "অনুবাদ বা রিপ্লাই পেতে বামে টেক্সট লিখে বাটনে ক্লিক করুন।"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs text-muted-foreground animate-pulse">
                AI বিশ্লেষণ ও ইংরেজি সাজাচ্ছে...
              </p>
            </div>
          ) : !result ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border/60 rounded-2xl">
              <Sparkles className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-medium text-foreground">কোনো ফলাফল নেই</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                বামে টেক্সট লিখে &quot;অনুবাদ ও রিপ্লাই তৈরি করুন&quot; বাটনে ক্লিক করলে ফলাফল এখানে দৃশ্যমান হবে।
              </p>
            </div>
          ) : result.error ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs">
                <AlertCircle className="h-4 w-4" />
                <span>ত্রুটি ঘটেছে</span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">{result.error}</p>
            </div>
          ) : result.mode === "english_to_bangla" && result.banglaView ? (
            <div className="space-y-4">
              {/* Bangla Translation */}
              <div className="p-4 rounded-2xl bg-muted/50 border border-border/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> বাংলা অর্থ
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        result.banglaView!.banglaTranslation,
                        "bn_res"
                      )
                    }
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {copiedKey === "bn_res" ? (
                      <Check className="h-3 w-3 text-primary" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    কপি
                  </button>
                </div>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {result.banglaView.banglaTranslation}
                </p>
                {result.banglaView.contextSummary && (
                  <p className="text-xs text-muted-foreground italic pt-1">
                    💡 {result.banglaView.contextSummary}
                  </p>
                )}
              </div>

              {/* 4 Suggested English Replies */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  পাল্টা রিপ্লাইয়ের অপশনসমূহ:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {(
                    Object.entries(result.banglaView.suggestedEnglishReplies) as [
                      ReplyTone,
                      string
                    ][]
                  ).map(([tone, text]) => (
                    <div
                      key={tone}
                      className="p-3 rounded-xl bg-card border border-border/70 flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex-1">
                        <Badge
                          variant="secondary"
                          className="capitalize text-[10px] mb-1"
                        >
                          {tone}
                        </Badge>
                        <p className="text-xs text-foreground font-medium">
                          {stripQuotes(text)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(text, `rep_${tone}`)}
                        className="h-7 text-xs px-2"
                      >
                        {copiedKey === `rep_${tone}` ? (
                          <Check className="h-3 w-3 text-primary" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Banglish to English 4 Tones */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/70">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-0.5">
                  আপনার বক্তব্যের অর্থ:
                </span>
                <p className="text-xs font-medium text-foreground">
                  {result.banglishReplies?.detectedBanglishMeaning}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  ৪টি স্টাইলে সাজানো ইংরেজি রিপ্লাই:
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {result.banglishReplies?.replies &&
                    (
                      Object.entries(result.banglishReplies.replies) as [
                        ReplyTone,
                        string
                      ][]
                    ).map(([tone, repText]) => (
                      <div
                        key={tone}
                        className="p-3.5 rounded-2xl bg-card border border-border/70 space-y-2 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={tone === "professional" ? "accent" : "secondary"}
                              className="capitalize text-[10px]"
                            >
                              {tone}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {tone === "casual" && "বন্ধুবান্ধব বা ইনফরমাল চ্যাট"}
                              {tone === "professional" && "ক্লায়েন্ট বা অফিসের জন্য"}
                              {tone === "polite" && "ভদ্র ও মার্জিত অনুরোধ"}
                              {tone === "concise" && "সংক্ষিপ্ত ও স্পষ্ট"}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(repText, `b_rep_${tone}`)}
                            className="h-7 text-xs px-2.5 gap-1"
                          >
                            {copiedKey === `b_rep_${tone}` ? (
                              <Check className="h-3 w-3 text-primary" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            কপি
                          </Button>
                        </div>
                        <p className="text-xs font-medium text-foreground leading-relaxed">
                          {stripQuotes(repText)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
