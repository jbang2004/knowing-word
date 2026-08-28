"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("页面加载失败", error);
  }, [error]);

  return (
    <main className="route-state" role="alert">
      <span aria-hidden="true">再</span>
      <p className="kicker">暂时没有打开</p>
      <h1>这一页需要重新试一次</h1>
      <p>学习进度仍然保留着。请检查网络后重试，或者先回到学习首页。</p>
      <div>
        <button className="game-button primary" onClick={reset}>重新加载</button>
        <Link className="game-button ghost" href="/">返回首页</Link>
      </div>
    </main>
  );
}
