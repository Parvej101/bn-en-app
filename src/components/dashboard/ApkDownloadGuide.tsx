"use client";

import * as React from "react";
import {
  Download,
  CheckCircle2,
  GitBranch,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";

const DIRECT_APK_URL =
  "https://github.com/Parvej101/bn-en-app/releases/download/latest-apk/BN-ENG-Assistant.apk";
const RELEASES_PAGE_URL = "https://github.com/Parvej101/bn-en-app/releases";
const ACTIONS_PAGE_URL = "https://github.com/Parvej101/bn-en-app/actions";

export function ApkDownloadGuide() {
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopyDownloadLink = () => {
    navigator.clipboard.writeText(DIRECT_APK_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Direct Download Hero Card */}
      <Card className="border-primary/40 bg-card overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <BrandLogo size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">BN-ENG AI Assistant</CardTitle>
                  <Badge variant="success">v1.0.2 APK</Badge>
                </div>
                <CardDescription className="mt-1">
                  WhatsApp, Messenger ও Meta Business Suite-এর জন্য Zero App-Switching মোবাইল অ্যাপ
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={DIRECT_APK_URL}
                download="BN-ENG-Assistant.apk"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Download className="h-4 w-4" />
                Direct Download APK
              </a>

              <Button
                variant="outline"
                size="md"
                onClick={handleCopyDownloadLink}
                className="h-11 rounded-xl text-xs gap-1.5"
              >
                {copiedLink ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedLink ? "লিংক কপি হয়েছে!" : "ডাউনলোড লিংক কপি"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-5">
          {/* 3 Core Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">
                  1
                </span>
                Text Select Menu
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                WhatsApp বা যেকোনো অ্যাপে ইংরেজি টেক্সট সিলেক্ট করলে স্বয়ংক্রিয়ভাবে{" "}
                <strong className="text-foreground">✨ BN-ENG AI</strong> অপশন আসবে।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">
                  2
                </span>
                1-Tap Auto Replace
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                বাংলিশ লিখে পছন্দের ইংরেজি রিপ্লাই সিলেক্ট করলে চ্যাট বক্সে আপনার বাংলিশ মুছে সরাসরি ইংরেজি বসে যাবে।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">
                  3
                </span>
                Floating ⇄ ✨ Button
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Meta Business Suite, Messenger বা যেকোনো অ্যাপে ভাসমান বাটনে ১ ট্যাপেই বাংলা অর্থ ও ৪টি রেডি রিপ্লাই চলে আসবে।
              </p>
            </div>
          </div>

          {/* Direct Links & Auto-Update Info */}
          <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <GitBranch className="h-4 w-4 text-primary" />
                ডাইরেক্ট APK ডাউনলোড ও ১-ক্লিক আপডেট
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={RELEASES_PAGE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  GitHub Releases <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href={ACTIONS_PAGE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  Build Status <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              উপরের <strong className="text-foreground">Direct Download APK</strong> বাটনে ক্লিক করলেই কোনো Zip ছাড়া সরাসরি{" "}
              <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-[11px]">
                BN-ENG-Assistant.apk
              </code>{" "}
              ডাউনলোড হয়ে যাবে। ফোনে সরাসরি ডাউনলোড করতে চাইলে{" "}
              <strong className="text-foreground">ডাউনলোড লিংক কপি</strong> করে আপনার ফোনে পাঠিয়ে ওপেন করুন।
            </p>

            <div className="flex items-center gap-2 text-[11px] text-primary bg-primary/10 border border-primary/20 rounded-xl px-3 py-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>
                স্থায়ী সাইনিং কি (Permanent Keystore) যুক্ত থাকায় পরবর্তী যেকোনো ভার্সন আনইনস্টল ছাড়াই ১ ক্লিকে <strong>Update</strong> হবে!
              </span>
            </div>
          </div>

          {/* Required Permissions on Phone */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <span className="text-xs font-bold text-foreground block">
              ফোনে ইনস্টল করার পর মাত্র ২টি পারমিশন অন করতে হবে:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    1. Display over other apps
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  যাতে WhatsApp, Messenger ও Business Suite থেকে বের না হয়েও স্ক্রিনের ওপরে ফ্লোটিং বাটন ও কার্ড দেখা যায়।
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    2. Accessibility Service (BN-ENG Assistant)
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  চ্যাট বক্সে আপনার বাংলিশ লেখাকে ১-ট্যাপে সরাসরি সুন্দর ইংরেজি দিয়ে রিপ্লেস করার জন্য।
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
