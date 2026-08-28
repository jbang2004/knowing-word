import Link from "next/link";

export default function NotFound() {
  return (
    <main className="route-state">
      <span aria-hidden="true">寻</span>
      <p className="kicker">没有找到这一页</p>
      <h1>可能是课程地址已经变化</h1>
      <p>回到课程地图，可以继续从当前进度学习。</p>
      <div>
        <Link className="game-button primary" href="/lessons">打开课程地图</Link>
        <Link className="game-button ghost" href="/">返回首页</Link>
      </div>
    </main>
  );
}
