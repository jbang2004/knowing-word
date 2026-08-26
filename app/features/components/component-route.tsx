"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { ComponentItem } from "../../data/catalog-types";
import type { HomeCandidate } from "../../data/home-index.generated";
import { safeInternalReturnPath } from "../../lib/navigation";
import { useStudyProfile } from "../profile/use-study-profile";
import { LearningPageShell, PageHeading } from "../shell/learning-page-shell";

const COMPONENT_PAGE_SIZE = 36;

function ComponentStoryContent({
  selected,
  connected,
}: {
  selected: ComponentItem;
  connected: HomeCandidate[];
}) {
  return (
    <>
      <div className="component-story-glyph">{selected.glyph}</div>
      <p className="kicker">部件精讲</p>
      <h2>{selected.title}</h2>
      <p>{selected.description}</p>
      <section>
        <span>常见例字</span>
        <div>{selected.examples.map((item) => <i key={item}>{item}</i>)}</div>
      </section>
      <section>
        <span>本册里遇见它</span>
        <div className="component-linked-list">
          {connected.length
            ? connected.map((character) => (
              <Link href={`/lessons/${character.lessonId}/words/${character.id}`} key={character.id}>
                <b>{character.hanzi}</b>
                <small>第 {Number(character.lessonId.slice(-2))} 课</small>
              </Link>
            ))
            : <p>这个部件会在后续词语里出现。</p>}
        </div>
      </section>
    </>
  );
}

export default function ComponentRoute({
  components,
  characters,
  initialComponentId,
  returnTo = "/practice",
}: {
  components: ComponentItem[];
  characters: HomeCandidate[];
  initialComponentId?: string;
  returnTo?: string;
}) {
  const router = useRouter();
  const allComponents = components;
  const { profile, setProfile } = useStudyProfile();
  const [selectedId, setSelectedId] = useState(
    allComponents.some((item) => item.id === initialComponentId) ? initialComponentId! : allComponents[0].id,
  );
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"frequency" | "recent">("frequency");
  const [visibleLimit, setVisibleLimit] = useState(COMPONENT_PAGE_SIZE);
  const [detailsOpen, setDetailsOpen] = useState(Boolean(initialComponentId));
  const selected = allComponents.find((item) => item.id === selectedId) ?? allComponents[0];
  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    const filtered = allComponents
      .filter((component) => !term || [component.title, component.glyph, component.examples.join(" ")].join(" ").toLocaleLowerCase().includes(term))
      .sort((left, right) => {
        if (sortMode === "recent") {
          const leftIndex = profile.recentComponents.indexOf(left.id);
          const rightIndex = profile.recentComponents.indexOf(right.id);
          return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex) || left.sequence - right.sequence;
        }
        return (right.characterSet.length || right.examples.length) - (left.characterSet.length || left.examples.length) || left.sequence - right.sequence;
      });
    return sortMode === "recent"
      ? filtered.filter((component) => profile.recentComponents.includes(component.id))
      : filtered;
  }, [allComponents, profile.recentComponents, search, sortMode]);
  const visiblePage = visible.slice(0, visibleLimit);
  const connectedGlyphs = new Set(selected.characterSet.length ? selected.characterSet : selected.examples);
  const connected = characters.filter((character) => connectedGlyphs.has(character.hanzi));
  const recent = allComponents.find((component) => component.id === profile.recentComponents[0]);

  useEffect(() => {
    if (!detailsOpen || !window.matchMedia("(max-width: 760px)").matches) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailsOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [detailsOpen]);

  function selectComponent(component: ComponentItem) {
    setSelectedId(component.id);
    setDetailsOpen(true);
    setProfile((previous) => ({
      ...previous,
      learnedComponents: previous.learnedComponents.includes(component.id) ? previous.learnedComponents : [...previous.learnedComponents, component.id],
      recentComponents: [component.id, ...previous.recentComponents.filter((id) => id !== component.id)].slice(0, 24),
    }));
    const query = new URLSearchParams({ component: component.id });
    const safeReturn = safeInternalReturnPath(returnTo);
    if (safeReturn) query.set("returnTo", safeReturn);
    router.replace(`/bujian?${query}`, { scroll: false });
  }

  function chooseSortMode(mode: "frequency" | "recent") {
    setSortMode(mode);
    setVisibleLimit(COMPONENT_PAGE_SIZE);
  }

  return (
    <LearningPageShell active="practice" name={profile.name}>
      <div className="page components-page">
        <PageHeading density="utility" kicker="部件精讲" title="从常见部件入手，识字更轻松" copy="先按课内出现次数排序，再把一个部件放回真实的词语中理解。" backHref={returnTo} />
        {recent && <section className="component-resume"><span>上次学到</span><strong>{recent.glyph}</strong><p>{recent.title}</p><button className="game-button ghost" onClick={() => selectComponent(recent)}>继续 →</button></section>}
        <div className="component-layout">
          <section className="component-browser">
            <div className="component-browser-toolbar">
              <div className="component-sort-tabs">
                <button aria-pressed={sortMode === "frequency"} className={sortMode === "frequency" ? "is-active" : ""} onClick={() => chooseSortMode("frequency")}>常用部件</button>
                <button aria-pressed={sortMode === "recent"} className={sortMode === "recent" ? "is-active" : ""} onClick={() => chooseSortMode("recent")}>最近学习</button>
              </div>
              <label className="component-search"><span className="sr-only">搜索部件或例字</span><i aria-hidden="true">⌕</i><input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleLimit(COMPONENT_PAGE_SIZE); }} placeholder="搜部件或例字" /></label>
            </div>
            <div className="component-browser-summary" aria-live="polite">
              <strong>{sortMode === "recent" ? "最近打开的部件" : search ? `“${search}”的结果` : "按课内出现频率排列"}</strong>
              <span>{visible.length ? `显示 ${Math.min(visibleLimit, visible.length)} / ${visible.length}` : "暂无结果"}</span>
            </div>
            {visiblePage.length ? (
              <>
                <div className="component-card-grid">
                  {visiblePage.map((component) => (
                    <button
                      aria-current={component.id === selected.id ? "true" : undefined}
                      className={`${component.id === selected.id ? "is-selected " : ""}${profile.learnedComponents.includes(component.id) ? "is-learned" : ""}`}
                      key={component.id}
                      onClick={() => selectComponent(component)}
                    >
                      <strong>{component.glyph}</strong>
                      {component.title !== component.glyph && <span>{component.title}</span>}
                      <small>课内 {component.characterSet.length || component.examples.length} 次</small>
                    </button>
                  ))}
                </div>
                {visibleLimit < visible.length && (
                  <button className="component-load-more" onClick={() => setVisibleLimit((limit) => limit + COMPONENT_PAGE_SIZE)}>
                    再显示 {Math.min(COMPONENT_PAGE_SIZE, visible.length - visibleLimit)} 个
                  </button>
                )}
              </>
            ) : (
              <div className="component-empty">
                <strong>{sortMode === "recent" ? "还没有最近学习的部件" : "没有找到匹配的部件"}</strong>
                <p>{sortMode === "recent" ? "打开一个常用部件后，它会出现在这里。" : "可以换一个部件名称或例字再试。"}</p>
                {sortMode === "recent" && <button onClick={() => chooseSortMode("frequency")}>查看常用部件</button>}
              </div>
            )}
          </section>
          <aside className="component-story component-story-desktop">
            <ComponentStoryContent selected={selected} connected={connected} />
          </aside>
        </div>
        {detailsOpen && typeof document !== "undefined" && createPortal(
          <>
            <button className="component-sheet-backdrop" onClick={() => setDetailsOpen(false)} aria-label="关闭部件精讲" />
            <aside className="component-story component-story-sheet" role="dialog" aria-modal="true" aria-label={`${selected.glyph}部件精讲`}>
              <button autoFocus className="component-sheet-close" onClick={() => setDetailsOpen(false)}>关闭</button>
              <ComponentStoryContent selected={selected} connected={connected} />
            </aside>
          </>,
          document.body,
        )}
      </div>
    </LearningPageShell>
  );
}
