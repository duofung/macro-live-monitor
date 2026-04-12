import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExpoRadar | Macro Intelligence Terminal",
  description:
    "Professional-grade macro dashboard for monitoring geopolitical shocks, cross-asset moves, and AI-driven causal-chain analysis.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
