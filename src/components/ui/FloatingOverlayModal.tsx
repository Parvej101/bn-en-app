"use client";

import * as React from "react";
import {
  Sparkles,
  Check,
  Copy,
  ArrowRightLeft,
  X,
  Volume2,
  BookOpen,
  MessageSquare,
  Cpu,
} from "lucide-react";
import { TranslationApiResponse, ReplyTone } from "@/types/assistant.types";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

interface FloatingOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TranslationApiResponse | null;
  isLoading: boolean;
  onSelectReply: (replyText: string) => void;
  isEditableInput: boolean;
}

export function FloatingOverlayModal({
  isOpen,
  onClose,
  data,
  isLoading,
  onSelectReply,
  isEditableInput,
}: FloatingOverlayModalProps) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [selectedTone, setSelectedTone] = React.useState<ReplyTone>("casual");

  if (!isOpen) return null;

  const stripQuotes = (text: string) => {
    return text.replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();
  };

  const handleCopy = (text: string, key: string) => {
    const cleanText = stripQuotes(text);
    navigator.clipboard.writeText(cleanText);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApply = (text: string) => {
    onSelectReply(stripQuotes(text));
  };

  return (
    <div className="absolute inset-x-2 bottom-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-md shadow-2xl p-4 text-card-foreground overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-wide text-foreground">
                  BN-ENG In-App Assistant
                </span>
                <Badge variant="success" className="text-[10px] py-0 px-1.5">
                  Live
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                {data?.providerUsed || "Dual AI Engine"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-xs text-muted-foreground animate-pulse">
              AI অনুবাদ ও রিপ্লাই তৈরি করছে...
            </p>
          </div>
        ) : !data ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            কোনো ডাটা পাওয়া যায়নি।
          </div>
        ) : data.mode === "english_to_bangla" && data.banglaView ? (
          /* English ➔ Bangla Quick View Mode */
          <div className="pt-3 space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {/* Bangla Translation Card */}
            <div className="rounded-xl bg-muted/60 p-3 border border-border/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> বাংলা সহজ অর্থ
                </span>
                <button
                  onClick={() =>
                    handleCopy(data.banglaView!.banglaTranslation, "bn_trans")
                  }
                  className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {copiedKey === "bn_trans" ? (
                    <Check className="h-3 w-3 text-primary" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  কপি
                </button>
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {data.banglaView.banglaTranslation}
              </p>
              {data.banglaView.contextSummary && (
                <p className="text-xs text-muted-foreground mt-1.5 italic">
                  💡 {data.banglaView.contextSummary}
                </p>
              )}
            </div>

            {/* Vocabulary Breakdown if available */}
            {data.banglaView.wordBreakdowns &&
              data.banglaView.wordBreakdowns.length > 0 && (
                <div className="rounded-xl bg-secondary/40 p-2.5 border border-border/40">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    মূল শব্দ ও অর্থ
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.banglaView.wordBreakdowns.map((wb, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] bg-card px-2 py-0.5 rounded-md border border-border/60"
                      >
                        <span className="font-semibold text-foreground">
                          {wb.word}:
                        </span>
                        <span className="text-muted-foreground">
                          {wb.meaning}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Quick English Replies to Send Back */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-primary" />
                  রেডি ইংরেজি রিপ্লাই সাজেশন:
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {(
                  Object.entries(data.banglaView.suggestedEnglishReplies) as [
                    ReplyTone,
                    string
                  ][]
                ).map(([tone, replyText]) => (
                  <div
                    key={tone}
                    onClick={() => handleApply(replyText)}
                    className="group flex items-center justify-between p-2 rounded-xl bg-muted/40 hover:bg-primary/10 border border-border/50 hover:border-primary/40 cursor-pointer transition-all"
                  >
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Badge
                          variant="secondary"
                          className="capitalize text-[9px] px-1.5 py-0"
                        >
                          {tone}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground group-hover:text-primary transition-colors">
                        {stripQuotes(replyText)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      className="h-7 text-[11px] px-2.5 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(replyText);
                      }}
                    >
                      {isEditableInput ? "রিপ্লেস করুন" : "রিপ্লাই দিন"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Banglish ➔ Polished English Replies Mode */
          <div className="pt-3 space-y-3 max-h-[340px] overflow-y-auto pr-1">
            <div className="rounded-xl bg-muted/50 p-2.5 border border-border/40">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
                আপনার বাংলিশ থেকে AI যা বুঝেছে:
              </span>
              <p className="text-xs font-medium text-foreground">
                {data.banglishReplies?.detectedBanglishMeaning ||
                  data.banglishReplies?.originalBanglish}
              </p>
            </div>

            {/* Tone Selector Tabs */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-foreground block">
                আপনার পছন্দের ইংরেজি টোন সিলেক্ট করুন:
              </span>
              <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-muted/70">
                {(["casual", "professional", "polite", "concise"] as ReplyTone[]).map(
                  (tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      className={cn(
                        "py-1 text-[11px] font-medium rounded-md capitalize transition-all",
                        selectedTone === tone
                          ? "bg-card text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tone === "concise" ? "Short" : tone}
                    </button>
                  )
                )}
              </div>

              {/* Chosen English Tone Card */}
              {data.banglishReplies?.replies && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 mt-2">
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {stripQuotes(data.banglishReplies.replies[selectedTone])}
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-primary/20">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        handleCopy(
                          data.banglishReplies!.replies[selectedTone],
                          "active_reply"
                        )
                      }
                    >
                      {copiedKey === "active_reply" ? (
                        <Check className="h-3 w-3 text-primary mr-1" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      কপি
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      className="h-7 text-[11px] px-3 gap-1 shadow-sm font-semibold"
                      onClick={() =>
                        handleApply(
                          data.banglishReplies!.replies[selectedTone]
                        )
                      }
                    >
                      <ArrowRightLeft className="h-3 w-3" />
                      {isEditableInput
                        ? "সরাসরি ইনপুটে বসান"
                        : "ইনপুটে পাঠান"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
