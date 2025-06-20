import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JobFind 2025 - あなたの理想のキャリアを見つけよう",
  description: "最高の企業との出会いがここにある。就活生のための包括的なキャリア支援プラットフォーム。求人検索、企業分析、キャリアアドバイザーによる個別サポートまで。",
  keywords: "就活, 求人, キャリア, 新卒採用, インターンシップ, 企業研究",
  openGraph: {
    title: "JobFind 2025 - あなたの理想のキャリアを見つけよう",
    description: "最高の企業との出会いがここにある。就活生のための包括的なキャリア支援プラットフォーム。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobFind 2025 - あなたの理想のキャリアを見つけよう",
    description: "最高の企業との出会いがここにある。就活生のための包括的なキャリア支援プラットフォーム。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
