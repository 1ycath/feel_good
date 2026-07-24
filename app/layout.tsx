import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "不是商业摄影",
  description: "只是自我感觉良好",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
