"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { primaryNavigation, type PrimaryNavigationId } from "../../lib/navigation";

function NavigationIcon({ id }: { id: PrimaryNavigationId }) {
  const shared = {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (id === "home") {
    return <svg {...shared}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>;
  }
  if (id === "course") {
    return (
      <svg {...shared}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
        <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5" />
      </svg>
    );
  }
  if (id === "practice") {
    return (
      <svg {...shared}>
        <rect x="3" y="3" width="7.5" height="7.5" rx="2.4" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.4" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.4" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.4" />
      </svg>
    );
  }
  return <svg {...shared}><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></svg>;
}

export function LearningPageShell({
  active,
  name,
  children,
}: {
  active: PrimaryNavigationId;
  name: string;
  children: ReactNode;
}) {
  const initial = name ? name.slice(0, 1) : "学";
  return (
    <div className="app-shell">
      <nav className="app-sidebar" aria-label="主菜单">
        <Link className="app-sidebar-brand" href="/" aria-label="回到 Knowing Word 首页">
          <span className="app-sidebar-seal" aria-hidden="true">知</span>
          <span>
            <strong>KNOWING WORD</strong>
            <small>从一个字，看见一方世界</small>
          </span>
        </Link>
        <div className="app-sidebar-links">
          {primaryNavigation.map((item) => (
            <Link
              className={item.id === active ? "is-active" : ""}
              href={item.href}
              key={item.id}
              aria-current={item.id === active ? "page" : undefined}
            >
              <NavigationIcon id={item.id} />
              {item.label}
            </Link>
          ))}
        </div>
        <Link className="app-sidebar-account" href="/account" aria-label={`打开${name || "我的"}学习空间`}>
          <span aria-hidden="true">{initial}</span>
          <span>
            <strong>{name || "学习空间"}</strong>
            <small>五年级上册</small>
          </span>
        </Link>
      </nav>

      <main className="game-shell">{children}</main>

      <nav className="app-tabbar" aria-label="主菜单">
        {primaryNavigation.map((item) => (
          <Link
            className={item.id === active ? "is-active" : ""}
            href={item.href}
            key={item.id}
            aria-current={item.id === active ? "page" : undefined}
          >
            <NavigationIcon id={item.id} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeading({
  kicker,
  title,
  copy,
  backHref,
  density = "editorial",
}: {
  kicker: string;
  title: string;
  copy: string;
  backHref?: string;
  density?: "editorial" | "utility";
}) {
  return (
    <header className={`${backHref ? "page-heading" : "page-heading is-root"}${density === "utility" ? " is-utility" : ""}`}>
      {backHref && (
        <Link className="back-button" href={backHref} aria-label="返回">
          <ArrowLeft aria-hidden="true" />
        </Link>
      )}
      <div>
        <p className="kicker">{kicker}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
    </header>
  );
}
