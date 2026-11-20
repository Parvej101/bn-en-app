"use client";

import * as React from "react";
import {
  Download,
  Smartphone,
  CheckCircle2,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export function ApkDownloadGuide() {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="border-primary/30 bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>BN-ENG Mobile APK — Zero App-Switching Setup</CardTitle>
                <CardDescription>
                  আপনার অ্যান্ড্রয়েড ফোনে অ্যাপটি ইনস্টল করে WhatsApp ও Messenger-এ ব্যবহারের সম্পূর্ণ নিয়ম
                </CardDescription>
              </div>
            </div>
            <Badge variant="success">Production Ready</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 3 Core Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">1</span>
                Text Select Menu
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                WhatsApp বা যেকোনো অ্যাপে ইংরেজি টেক্সট সিলেক্ট করলে স্বয়ংক্রিয়ভাবে <strong className="text-foreground">✨ BN-ENG AI</strong> অপশন আসবে।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">2</span>
                1-Tap Auto Replace
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                বাংলিশ লিখে পছন্দের ইংরেজি রিপ্লাই সিলেক্ট করলে চ্যাট বক্সে আপনার বাংলিশ মুছে সরাসরি ইংরেজি বসে যাবে।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">3</span>
                Floating ✨ Button
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                টেক্সট কপি করলেই স্ক্রিনের ওপর ভাসমান কার্ডে সহজ বাংলা অর্থ, শব্দের ব্যাখ্যা ও ৩টি রেডি রিপ্লাই দেখাবে।
              </p>
            </div>
          </div>

          {/* GitHub Actions Cloud APK Builder Guide */}
          <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <GitBranch className="h-4 w-4 text-primary" />
                ক্লাউডে অটোমেটিক APK তৈরি ও ডাউনলোড করার উপায়
              </span>
              <Badge variant="outline" className="text-[10px]">GitHub Actions CI/CD</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              আপনার পিসিতে অ্যান্ড্রয়েড স্টুডিও বা কোনো বড় সফটওয়্যার ছাড়াই সরাসরি রেডি <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-[11px]">.apk</code> ফাইল ডাউনলোড করার জন্য প্রজেক্টে <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-[11px]">.github/workflows/build-android-apk.yml</code> ফাইল রেডি করে দেওয়া হয়েছে।
            </p>
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside pl-1">
              <li>
                এই প্রজেক্টটি আপনার GitHub রিপোজিটরিতে পুশ করুন (<code className="text-foreground bg-muted px-1 rounded">git push origin main</code>)।
              </li>
              <li>
                GitHub-এর <strong className="text-foreground">Actions</strong> ট্যাবে যান। স্বয়ংক্রিয়ভাবে <strong>&quot;Build Android APK&quot;</strong> রান হবে।
              </li>
              <li>
                বিল্ড শেষ হলে <strong>Artifacts</strong> সেকশন থেকে ১-ক্লিকে <strong className="text-primary">BN-ENG-Assistant.apk</strong> ফাইলটি ডাউনলোড করে আপনার অ্যান্ড্রয়েড ফোনে ইনস্টল করে নিন!
              </li>
            </ol>
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
                  যাতে WhatsApp বা Messenger থেকে বের না হয়েও স্ক্রিনের ওপরে অনুবাদ ও ফ্লোটিং কার্ড দেখা যায়।
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
