import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") || incoming.get("host") || "knowing-word.jbang2004.chatgpt.site";
  const protocol = incoming.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const origin = new URL(`${protocol}://${host}`);
  const imageUrl = new URL("/og.png", origin).toString();
  const description = "以课文词语表、字义故事、专项练习与学习记录串联的中文识字学习空间。";
  return {
    metadataBase: origin,
    title: "Knowing Word · 课程地图与汉字闯关",
    description,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Knowing Word",
      description,
      type: "website",
      images: [{ url: imageUrl, width: 1672, height: 941, alt: "Knowing Word 汉字学习地图" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Knowing Word",
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
