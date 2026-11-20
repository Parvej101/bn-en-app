import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BN-ENG AI Assistant | Banglish to English & In-App Quick Translator",
  description:
    "Zero app-switching mobile translation and reply assistant for WhatsApp and Messenger. Translate English to Bangla in-place and turn Banglish into polished English replies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
