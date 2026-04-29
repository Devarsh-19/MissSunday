import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Ticker from "@/components/Ticker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Miss Sunday AI Agent Platform",
  description: "Production-grade AI agent platform with multi-agent workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <Ticker />

        {/* Background Blobs for premium aesthetic */}
        <div className="bg-blob bg-blue-600/20 w-[500px] h-[500px] top-[-100px] left-[-100px] animate-pulse-slow"></div>
        <div className="bg-blob bg-purple-600/20 w-[600px] h-[600px] bottom-[-200px] right-[-100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

        <Sidebar />

        <main className="ml-64 mt-10 min-h-screen relative z-10 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
