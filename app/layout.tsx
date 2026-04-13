import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExpoRadar | 新能源展览招标监控中心",
  description:
    "聚焦新能源产业链企业展览招标、海外展会特装项目与竞标机会的前端监控看板。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
