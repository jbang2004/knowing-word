import type { Metadata } from "next";
import { StudyProfileProvider } from "./features/profile/use-study-profile";
import "./globals.css";
import "./app-shell.css";
import "./catalog.css";
import "./study.css";
import "./challenge.css";
import "./home-path.css";
import "./utility-pages.css";
import "./lesson-reader.css";
import "./solid-blocks.css";
import "./adventure.css";

export function generateMetadata(): Metadata {
  const origin = new URL("https://knowing-word.jbang2004.chatgpt.site");
  const imageUrl = new URL("/og-cover.jpg", origin).toString();
  const description = "统编版五年级上册 26 课识字地图：用图中嵌字、字义讲解、拆字练习与写字巩固，把课内汉字真正记进脑海。";
  return {
    metadataBase: origin,
    title: "Knowing Word · 五年级上册 26 课汉字学习地图",
    description,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Knowing Word · 五年级上册 26 课汉字学习地图",
      description,
      type: "website",
      images: [{ url: imageUrl, width: 1672, height: 941, alt: "知字 · Knowing Word 汉字学习地图" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Knowing Word · 五年级上册 26 课汉字学习地图",
      description,
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <StudyProfileProvider>{children}</StudyProfileProvider>
      </body>
    </html>
  );
}
