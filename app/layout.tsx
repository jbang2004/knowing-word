import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./product.css";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") || incoming.get("host") || "knowing-word.jbang2004.chatgpt.site";
  const protocol = incoming.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const origin = new URL(`${protocol}://${host}`);
  const imageUrl = new URL("/og.png", origin).toString();
  const description = "从图像、字义和部件出发，轻松认识五年级上册 26 课汉字。每天十分钟，看懂、拆开、记住。";
  return {
    metadataBase: origin,
    title: "知字 Knowing Word · 看见一个字，记住一个世界",
    description,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "知字 Knowing Word · 看见一个字，记住一个世界",
      description,
      type: "website",
      images: [{ url: imageUrl, width: 1731, height: 909, alt: "孩子在巨大的汉字‘字’中探索语言世界" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "知字 Knowing Word · 看见一个字，记住一个世界",
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
      <body>{children}</body>
    </html>
  );
}
