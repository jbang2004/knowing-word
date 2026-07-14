import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Knowing Word · 课程地图与汉字闯关",
  description:
    "以课文词语表、字义故事、专项练习与学习记录串联的中文识字学习空间。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Knowing Word",
    description: "A course-first Chinese character learning journey.",
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
