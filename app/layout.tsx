import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ElevenLabsProvider } from "@/components/providers/ElevenLabsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Marketplace - Voice-First Platform",
  description: "A voice-first marketplace connecting buyers and sellers with AI-powered features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ElevenLabsProvider>
          <AuthProvider>{children}</AuthProvider>
        </ElevenLabsProvider>
      </body>
    </html>
  );
}
