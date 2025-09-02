import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@/components/providers/query-client-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SnapFinder - 제주 인기 스냅들을 한눈에!",
  description: "제주도 커플스냅, 가족스냅, 우정스냅을 쉽게 찾아보세요. 인스타와 네이버에서 찾기 힘든 다양한 스냅 패키지들을 한곳에서 만나보세요.",
  keywords: "제주도 스냅, 커플스냅, 가족스냅, 우정스냅, 제주 사진촬영, 제주 포토그래퍼",
  authors: [{ name: "SnapFinder" }],
  openGraph: {
    title: "SnapFinder - 제주 인기 스냅들을 한눈에!",
    description: "제주도 커플스냅, 가족스냅, 우정스냅을 쉽게 찾아보세요.",
    type: "website",
    url: "https://jeju-snap-seek.lovableproject.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapFinder - 제주 인기 스냅들을 한눈에!",
    description: "제주도 커플스냅, 가족스냅, 우정스냅을 쉽게 찾아보세요.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3433360229161618" crossOrigin="anonymous"></script>
      </head>
      <body className={inter.className}>
        <QueryClientProvider>
          <TooltipProvider>
            {children}
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}