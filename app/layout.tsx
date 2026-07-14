import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Knowing Word · 看见每一个字的故事",
  description:
    "一个以字形、字义、部件与练习为核心的中文识字学习空间。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Knowing Word",
    description: "Learn the stories inside every character.",
    images: [{ url: "/og.png", width: 1680, height: 940 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
