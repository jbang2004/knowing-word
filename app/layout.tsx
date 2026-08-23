import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./catalog.css";
import "./study.css";
import "./challenge.css";
import "./home-path.css";
import "./utility-pages.css";
import ServiceWorkerRegistration from "./service-worker-registration";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") || incoming.get("host") || "knowing-word.jbang2004.chatgpt.site";
  const protocol = incoming.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const origin = new URL(`${protocol}://${host}`);
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
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
