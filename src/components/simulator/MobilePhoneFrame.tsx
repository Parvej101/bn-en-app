"use client";

import * as React from "react";
import {
  Send,
  Sparkles,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Smile,
  Paperclip,
  CheckCheck,
  Check,
  Settings,
  Wifi,
  Battery,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import { FloatingOverlayModal } from "@/components/ui/FloatingOverlayModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ChatMessage,
  TranslationApiResponse,
  AIProvider,
} from "@/types/assistant.types";
import { cn } from "@/lib/utils";

interface MobilePhoneFrameProps {
  apiKey: string;
  provider: AIProvider;
  onOpenSettings: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    sender: "friend",
    text: "Hey! Could we please reschedule tomorrow's client presentation to 5:00 PM? Let me know if that works for your team.",
    time: "10:14 AM",
    status: "read",
    detectedLanguage: "english",
  },
  {
    id: "m2",
    sender: "friend",
    text: "Also please make sure the invoice for milestone 2 is ready before we hop on the call.",
    time: "10:15 AM",
    status: "read",
    detectedLanguage: "english",
  },
];

export function MobilePhoneFrame({
  apiKey,
  provider,
  onOpenSettings,
}: MobilePhoneFrameProps) {
  const [appTheme, setAppTheme] = React.useState<"whatsapp" | "messenger">(
    "whatsapp"
  );
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = React.useState(
    "bhai kal 5 tay meeting koren ami ektu busy thakbo"
  );
  const [selectedBubbleId, setSelectedBubbleId] = React.useState<string | null>(
    null
  );
  const [showInputSelectToolbar, setShowInputSelectToolbar] =
    React.useState(false);

  // Overlay modal state
  const [overlayOpen, setOverlayOpen] = React.useState(false);
  const [overlayData, setOverlayData] =
    React.useState<TranslationApiResponse | null>(null);
  const [overlayLoading, setOverlayLoading] = React.useState(false);
  const [isEditableTarget, setIsEditableTarget] = React.useState(false);

  // Trigger translation through /api/translate
  const triggerTranslation = async (
    targetText: string,
    isEditable: boolean,
    forcedMode?: "english_to_bangla" | "banglish_to_english"
  ) => {
    setIsEditableTarget(isEditable);
    setOverlayOpen(true);
    setOverlayLoading(true);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: targetText,
          provider,
          apiKey,
          forcedMode,
        }),
      });
      const data: TranslationApiResponse = await res.json();
      setOverlayData(data);
    } catch (err) {
      console.error("Translation request failed:", err);
    } finally {
      setOverlayLoading(false);
    }
  };

  // User taps on an English message bubble
  const handleBubbleClick = (msg: ChatMessage) => {
    if (msg.sender === "friend") {
      setSelectedBubbleId(msg.id);
      setShowInputSelectToolbar(false);
    }
  };

  // User triggers translate on selected English message
  const handleTranslateSelectedMessage = (text: string) => {
    setSelectedBubbleId(null);
    triggerTranslation(text, false, "english_to_bangla");
  };

  // User taps floating sparkle button or selects input text
  const handleTranslateInput = () => {
    if (!inputText.trim()) return;
    setShowInputSelectToolbar(false);
    triggerTranslation(inputText, true, "banglish_to_english");
  };

  // In-place replacement
  const handleApplyReply = (replyText: string) => {
    setInputText(replyText);
    setOverlayOpen(false);
    setShowInputSelectToolbar(false);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "me",
      text: inputText,
      time: "Just now",
      status: "sent",
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setShowInputSelectToolbar(false);
  };

  return (
    <div className="relative mx-auto w-full max-w-[390px] h-[780px] rounded-[44px] border-[8px] border-foreground/15 bg-background shadow-2xl overflow-hidden flex flex-col font-sans select-none ring-1 ring-border">
      {/* Phone Notch & Status Bar */}
      <div className="bg-card/90 px-6 pt-3 pb-2 flex items-center justify-between text-xs text-foreground/80 z-20 border-b border-border/40">
        <span className="font-semibold text-xs tracking-tight">10:16</span>
        {/* Dynamic Island / Notch */}
        <div className="h-4 w-28 bg-foreground/15 rounded-full" />
        <div className="flex items-center gap-1.5 text-foreground/70">
          <Wifi className="h-3.5 w-3.5" />
          <Battery className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* App Header (WhatsApp vs Messenger style) */}
      <div
        className={cn(
          "px-3 py-2.5 flex items-center justify-between text-foreground z-20 transition-colors border-b",
          appTheme === "whatsapp"
            ? "bg-card border-border/60"
            : "bg-gradient-to-r from-card to-secondary/60 border-border/60"
        )}
      >
        <div className="flex items-center gap-2">
          <button className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center border border-primary/30">
              AL
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-xs text-foreground">
                Alex (Client USA)
              </span>
              <Badge variant="outline" className="text-[9px] px-1 py-0">
                {appTheme === "whatsapp" ? "WhatsApp" : "Messenger"}
              </Badge>
            </div>
            <span className="text-[10px] text-primary font-medium block">
              Online
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setAppTheme((prev) =>
                prev === "whatsapp" ? "messenger" : "whatsapp"
              )
            }
            title="Toggle WhatsApp / Messenger Theme"
            className="text-[10px] bg-muted hover:bg-muted/80 text-foreground px-2 py-1 rounded-md font-medium"
          >
            {appTheme === "whatsapp" ? "Switch Messenger" : "Switch WhatsApp"}
          </button>
          <button
            onClick={onOpenSettings}
            className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            title="Settings & API Key"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Feed Area */}
      <div
        onClick={() => {
          setSelectedBubbleId(null);
          setShowInputSelectToolbar(false);
        }}
        className="flex-1 p-3 overflow-y-auto space-y-3 bg-muted/20 relative"
      >
        {/* Floating Instruction Banner */}
        <div className="rounded-xl bg-card/80 border border-border/60 p-2.5 text-center shadow-xs">
          <p className="text-[11px] font-medium text-foreground">
            💡 <strong className="text-primary">পরীক্ষা করুন:</strong> যেকোনো মেসেজে ট্যাপ করে বাংলা অর্থ দেখুন, অথবা নিচে বাংলিশ লিখে ✨ বাটনে ট্যাপ করুন!
          </p>
        </div>

        {messages.map((msg) => {
          const isFriend = msg.sender === "friend";
          const isSelected = selectedBubbleId === msg.id;

          return (
            <div
              key={msg.id}
              className={cn(
                "relative flex flex-col",
                isFriend ? "items-start" : "items-end"
              )}
            >
              {/* Native Android Text Selection Menu Simulation */}
              {isSelected && isFriend && (
                <div className="absolute -top-11 left-0 z-30 flex items-center gap-1 bg-card border border-primary/40 rounded-xl px-1.5 py-1 shadow-xl animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => handleTranslateSelectedMessage(msg.text)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all"
                  >
                    <Sparkles className="h-3 w-3" />
                    ✨ BN-ENG AI
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(msg.text);
                      setSelectedBubbleId(null);
                    }}
                    className="px-2 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => setSelectedBubbleId(null)}
                    className="px-1.5 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Message Bubble */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleBubbleClick(msg);
                }}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs transition-all cursor-pointer relative",
                  isFriend
                    ? "bg-card text-card-foreground rounded-tl-xs border border-border/70 hover:border-primary/50"
                    : "bg-primary text-primary-foreground rounded-tr-xs font-normal",
                  isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                )}
              >
                <p className="leading-relaxed">{msg.text}</p>
                <div
                  className={cn(
                    "flex items-center justify-end gap-1 mt-1 text-[9px]",
                    isFriend
                      ? "text-muted-foreground"
                      : "text-primary-foreground/80"
                  )}
                >
                  <span>{msg.time}</span>
                  {!isFriend && <CheckCheck className="h-3 w-3" />}
                </div>

                {/* Micro In-Bubble Trigger Helper */}
                {isFriend && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTranslateSelectedMessage(msg.text);
                    }}
                    className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    বাংলা অর্থ ও রিপ্লাই দেখুন
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Sparkle Button (Simulating Android Accessibility Overlay Button) */}
      <div className="absolute right-4 bottom-20 z-40">
        <div className="relative group">
          <button
            onClick={handleTranslateInput}
            title="✨ BN-ENG Magic Overlay (1-Tap Translate & Polish)"
            className="h-11 w-11 rounded-full bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all ring-4 ring-card animate-pulse hover:animate-none"
          >
            <Sparkles className="h-5 w-5" />
          </button>
          <span className="absolute -top-7 right-0 text-[10px] whitespace-nowrap bg-card border border-border text-foreground px-2 py-0.5 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            ✨ In-App Polish
          </span>
        </div>
      </div>

      {/* Bottom Chat Input Bar with In-Place Replacement */}
      <div className="p-2.5 bg-card border-t border-border/60 z-20 relative">
        {/* Quick Banglish Phrases Suggestions */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-1 scrollbar-none">
          <span className="text-[10px] font-medium text-muted-foreground shrink-0">
            নমুনা:
          </span>
          {[
            "bhai kal 5 tay meeting koren ami ektu busy thakbo",
            "vai invoice ta ektu dekhen amra kaj shuru korechi",
            "ami apnar sathe kaj ta korte khub interested",
          ].map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(sample);
                setShowInputSelectToolbar(true);
              }}
              className="text-[10px] text-foreground bg-muted hover:bg-muted/80 px-2 py-0.5 rounded-full shrink-0 border border-border/60"
            >
              {sample.slice(0, 28)}...
            </button>
          ))}
        </div>

        {/* Input Text Box Toolbar (when selected) */}
        {showInputSelectToolbar && (
          <div className="absolute -top-10 left-3 z-30 flex items-center gap-1 bg-card border border-primary/50 rounded-xl px-2 py-1 shadow-xl animate-in fade-in">
            <button
              onClick={handleTranslateInput}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110"
            >
              <Sparkles className="h-3 w-3" />
              ✨ BN-ENG AI (Convert to English)
            </button>
            <button
              onClick={() => setShowInputSelectToolbar(false)}
              className="px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <div className="relative flex-1 flex items-center bg-muted/50 rounded-2xl border border-border/70 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/40 px-3 py-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => {
                if (inputText.trim()) setShowInputSelectToolbar(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="বাংলিশ বা ইংলিশ লিখুন..."
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none pr-6"
            />
            {inputText.trim().length > 0 && (
              <button
                onClick={handleTranslateInput}
                title="✨ এই বাংলিশ থেকে ইংরেজি রিপ্লাই তৈরি করুন"
                className="absolute right-2 text-primary hover:text-accent transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button
            size="icon"
            variant="primary"
            onClick={handleSendMessage}
            className="h-9 w-9 rounded-full shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Floating In-App Overlay Dialog (The Core Feature) */}
      <FloatingOverlayModal
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        data={overlayData}
        isLoading={overlayLoading}
        onSelectReply={handleApplyReply}
        isEditableInput={isEditableTarget}
      />
    </div>
  );
}
