export default function AppLoading() {
  return (
    <main className="route-state is-loading" aria-busy="true" aria-live="polite">
      <span aria-hidden="true">字</span>
      <p className="kicker">正在准备</p>
      <h1>把这一课的内容摆好…</h1>
      <p>课程与本机进度会一起恢复。</p>
    </main>
  );
}
