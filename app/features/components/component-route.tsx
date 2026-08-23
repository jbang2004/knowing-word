"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ComponentItem } from "../../data/catalog-types";
import { extensionComponents } from "../../data/extension-components.ts";
import { grade5Components } from "../../data/generated/grade5-volume1/components";
import { homeCandidates } from "../../data/home-index.generated";
import { safeInternalReturnPath } from "../../lib/navigation";
import { useStudyProfile } from "../profile/use-study-profile";
import { LearningPageShell, PageHeading } from "../shell/learning-page-shell";

const componentByGlyph = new Map<string, ComponentItem>();
for (const component of grade5Components as unknown as ComponentItem[]) componentByGlyph.set(component.glyph, component);
for (const component of extensionComponents) componentByGlyph.set(component.glyph, component);
const allComponents = [...componentByGlyph.values()];

export default function ComponentRoute({
  initialComponentId,
  returnTo = "/practice",
}: {
  initialComponentId?: string;
  returnTo?: string;
}) {
  const router = useRouter();
  const { profile, setProfile } = useStudyProfile();
  const [selectedId, setSelectedId] = useState(
    allComponents.some((item) => item.id === initialComponentId) ? initialComponentId! : allComponents[0].id,
  );
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"frequency" | "recent">("frequency");
  const selected = allComponents.find((item) => item.id === selectedId) ?? allComponents[0];
  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return allComponents
      .filter((component) => !term || [component.title, component.glyph, component.examples.join(" ")].join(" ").toLocaleLowerCase().includes(term))
      .sort((left, right) => {
        if (sortMode === "recent") {
          const leftIndex = profile.recentComponents.indexOf(left.id);
          const rightIndex = profile.recentComponents.indexOf(right.id);
          return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex) || left.sequence - right.sequence;
        }
        return (right.characterSet.length || right.examples.length) - (left.characterSet.length || left.examples.length) || left.sequence - right.sequence;
      });
  }, [profile.recentComponents, search, sortMode]);
  const connectedGlyphs = new Set(selected.characterSet.length ? selected.characterSet : selected.examples);
  const connected = homeCandidates.words.filter((character) => connectedGlyphs.has(character.hanzi));
  const recent = allComponents.find((component) => component.id === profile.recentComponents[0]);

  function selectComponent(component: ComponentItem) {
    setSelectedId(component.id);
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

  return (
    <LearningPageShell active="practice" name={profile.name}>
      <div className="page components-page">
        <PageHeading kicker="部件精讲" title="从常见部件入手，识字更轻松" copy="先按课内出现次数排序，再把一个部件放回真实的词语中理解。" backHref={returnTo} />
        {recent && <section className="component-resume"><span>上次学到</span><strong>{recent.glyph}</strong><p>{recent.title}</p><button className="game-button ghost" onClick={() => selectComponent(recent)}>继续 →</button></section>}
        <div className="component-layout">
          <section className="component-browser">
            <div className="component-browser-toolbar">
              <div className="component-sort-tabs">
                <button className={sortMode === "frequency" ? "is-active" : ""} onClick={() => setSortMode("frequency")}>按出现次数</button>
                <button className={sortMode === "recent" ? "is-active" : ""} onClick={() => setSortMode("recent")}>最近学习</button>
              </div>
              <label><i>⌕</i><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜部件或例字" /></label>
            </div>
            <div className="component-card-grid">
              {visible.map((component) => (
                <button className={`${component.id === selected.id ? "is-selected " : ""}${profile.learnedComponents.includes(component.id) ? "is-learned" : ""}`} key={component.id} onClick={() => selectComponent(component)}>
                  <strong>{component.glyph}</strong><span>{component.title}</span><small>课内 {component.characterSet.length || component.examples.length} 次</small>
                </button>
              ))}
            </div>
          </section>
          <aside className="component-story">
            <div className="component-story-glyph">{selected.glyph}</div>
            <p className="kicker">部件精讲</p><h2>{selected.title}</h2><p>{selected.description}</p>
            <section><span>常见例字</span><div>{selected.examples.map((item) => <i key={item}>{item}</i>)}</div></section>
            <section>
              <span>本册里遇见它</span>
              <div className="component-linked-list">
                {connected.length ? connected.map((character) => <Link href={`/lessons/${character.lessonId}/words/${character.id}`} key={character.id}><b>{character.hanzi}</b><small>第 {Number(character.lessonId.slice(-2))} 课</small></Link>) : <p>这个部件会在后续词语里出现。</p>}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </LearningPageShell>
  );
}
