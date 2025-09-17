import type { Metadata } from "next";
import { Inter, Noto_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto"
});

export const metadata: Metadata = {
  title: "AI 痛风饮食助手",
  description: "拍照识别食物嘌呤风险"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className={`${inter.variable} ${notoSans.variable}`} suppressHydrationWarning>
      <body className="bg-gradient-to-br from-[#f0fff4] to-[#e6f7ff] text-[#0e1b14]">
        {children}
      </body>
    </html>
  );
}
