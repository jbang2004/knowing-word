"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpenText,
  Home as HomeIcon,
  LayoutGrid,
  Map as MapIcon,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { primaryNavigation, type PrimaryNavigationId } from "../../lib/navigation";

const navigationIcons: Record<PrimaryNavigationId, typeof HomeIcon> = {
  home: HomeIcon,
  course: BookOpenText,
  practice: LayoutGrid,
  profile: UserRound,
};

export function LearningPageShell({
  active,
  name,
  children,
}: {
  active: PrimaryNavigationId;
  name: string;
  children: ReactNode;
}) {
  return (
    <main className="game-shell">
      <header className="top-navigation">
        <Link className="wordmark" href="/" aria-label="回到 Knowing Word 首页">
          <span className="brand-seal" aria-hidden="true">知</span>
          <span className="wordmark-copy">
            <strong>KNOWING WORD</strong>
            <span className="wordmark-flag">从一个字，看见一方世界</span>
          </span>
        </Link>
        <nav aria-label="主菜单">
          {primaryNavigation.map((item) => {
            const Icon = navigationIcons[item.id];
            return (
              <Link className={item.id === active ? "is-active" : ""} href={item.href} key={item.id}>
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <Link className="profile-pill" href="/account" aria-label={`打开${name || "我的"}学习空间`}>
          <span>{name ? name.slice(0, 1) : "学"}</span>
          <small>{name || "学习空间"}</small>
        </Link>
      </header>
      {children}
    </main>
  );
}

export function PageHeading({
  kicker,
  title,
  copy,
  backHref,
}: {
  kicker: string;
  title: string;
  copy: string;
  backHref?: string;
}) {
  return (
    <header className={backHref ? "page-heading" : "page-heading is-root"}>
      {backHref && <Link className="back-button" href={backHref}><ArrowLeft aria-hidden="true" />返回</Link>}
      <div>
        <p className="kicker">{kicker}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      <MapIcon className="page-heading-mark" aria-hidden="true" />
    </header>
  );
}
