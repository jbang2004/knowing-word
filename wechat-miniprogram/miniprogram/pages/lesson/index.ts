import { getLessonContent, isCoreCharacter, lessonCover, lessonIndex } from "../../services/catalog";
import { navigationLayout } from "../../services/layout";
import { loadProfile } from "../../services/profile";
import type { CatalogCharacter, CatalogLesson, LessonContent, TrackId } from "../../types/models";

type ViewCharacter = CatalogCharacter & { done: boolean; roleLabel: string; guideSectionId?: string };
type GuideInlineSegment = {
  key: string;
  text: string;
  targetId: string;
  targetWord: string;
  state: "plain" | "first" | "repeat";
  done: boolean;
};
type GuideParagraph = {
  id: string;
  text: string;
  segments: GuideInlineSegment[];
};
type GuideFocusGlyph = {
  key: string;
  text: string;
  targetId: string;
  pinyin: string;
  done: boolean;
};
type GuideFocusWord = {
  key: string;
  word: string;
  glyphs: GuideFocusGlyph[];
  targetIds: string[];
  done: boolean;
  wide: boolean;
};
type GuideSectionSource = NonNullable<LessonContent["document"]>["sections"][number];
type GuideSection = Omit<GuideSectionSource, "id" | "paragraphs"> & {
  id: string;
  paragraphs: GuideParagraph[];
  focusCharacters: ViewCharacter[];
  focusWordItems: GuideFocusWord[];
};
type ViewWordGroup = { key: string; word: string; characters: ViewCharacter[] };
type PracticeItem = { track: TrackId; glyph: string; menu: string; completed: number; total: number };

const practiceMeta: Array<Pick<PracticeItem, "track" | "glyph" | "menu">> = [
  { track: "words", glyph: "字", menu: "识字" },
  { track: "structure", glyph: "构", menu: "结构复习" },
  { track: "split", glyph: "拆", menu: "拆字复习" },
  { track: "honglan", glyph: "红蓝", menu: "红蓝复习" },
];

let pendingGuideSectionId = "";
let guideHighlightTimer: number | null = null;

function groupCharactersByWord(characters: ViewCharacter[]) {
  const groups = new Map<string, ViewCharacter[]>();
  for (const character of characters) {
    const key = `${character.wordPosition ?? character.word}-${character.word}`;
    groups.set(key, [...(groups.get(key) ?? []), character]);
  }
  return [...groups].map(([key, items]) => ({ key, word: items[0].word, characters: items }));
}

function wordMatches(text: string, words: readonly string[]) {
  const matches: Array<{ start: number; end: number; word: string }> = [];
  for (const word of words) {
    let from = 0;
    while (from < text.length) {
      const start = text.indexOf(word, from);
      if (start === -1) break;
      matches.push({ start, end: start + word.length, word });
      from = start + word.length;
    }
  }
  matches.sort((left, right) => left.start - right.start || right.end - left.end);
  return matches;
}

function decorateGuideParagraph(
  paragraph: GuideSectionSource["paragraphs"][number],
  paragraphIndex: number,
  words: readonly string[],
  characterByHanzi: Map<string, ViewCharacter>,
  seenCharacterIds: Set<string>,
): GuideParagraph {
  const segments: GuideInlineSegment[] = [];
  let cursor = 0;
  let segmentIndex = 0;
  const pushPlain = (text: string) => {
    if (!text) return;
    segments.push({
      key: `plain-${segmentIndex++}`,
      text,
      targetId: "",
      targetWord: "",
      state: "plain",
      done: false,
    });
  };

  for (const match of wordMatches(paragraph.text, words)) {
    if (match.start < cursor) continue;
    pushPlain(paragraph.text.slice(cursor, match.start));
    for (const glyph of Array.from(paragraph.text.slice(match.start, match.end))) {
      const character = characterByHanzi.get(glyph);
      if (!character) {
        pushPlain(glyph);
        continue;
      }
      const state = seenCharacterIds.has(character.id) ? "repeat" : "first";
      seenCharacterIds.add(character.id);
      segments.push({
        key: `target-${character.id}-${segmentIndex++}`,
        text: glyph,
        targetId: character.id,
        targetWord: match.word,
        state,
        done: false,
      });
    }
    cursor = match.end;
  }
  pushPlain(paragraph.text.slice(cursor));

  return {
    id: paragraph.id ?? `lesson-paragraph-${paragraphIndex + 1}`,
    text: paragraph.text,
    segments,
  };
}

function decorateFocusWords(words: readonly string[], characters: ViewCharacter[]): GuideFocusWord[] {
  return words.map((word, wordIndex) => {
    const targets = characters.filter((character) => character.word === word);
    const targetByHanzi = new Map(targets.map((character) => [character.hanzi, character]));
    const glyphs = Array.from(word).map((glyph, glyphIndex) => {
      const character = targetByHanzi.get(glyph);
      return {
        key: `${wordIndex}-${glyphIndex}`,
        text: glyph,
        targetId: character?.id ?? "",
        pinyin: character?.pinyin ?? "",
        done: false,
      };
    });
    return {
      key: `${wordIndex}-${word}`,
      word,
      glyphs,
      targetIds: targets.map((character) => character.id),
      done: false,
      wide: Array.from(word).length >= 5,
    };
  });
}

function decorateCharacter(character: CatalogCharacter): ViewCharacter {
  return {
    ...character,
    done: false,
    roleLabel: character.official === false || character.tier === "extension"
      ? "拓展"
      : character.curriculumRole === "write"
        ? "会写"
        : character.polyphonic || character.curriculumRole === "polyphonic"
          ? "多音字"
          : "会认",
  };
}

function progressItems(characters: ViewCharacter[]) {
  const profile = loadProfile();
  const learned = new Set(profile.completed.words);
  return practiceMeta.map((meta) => {
    const candidates = meta.track === "words"
      ? characters
      : characters.filter((character) => learned.has(character.id));
    const completed = new Set(profile.completed[meta.track]);
    return {
      ...meta,
      completed: candidates.filter((character) => completed.has(character.id)).length,
      total: candidates.length,
    };
  });
}

Page({
  data: {
    theme: loadProfile().theme,
    lessonId: lessonIndex[0].id,
    lesson: { ...lessonIndex[0], visual: { src: lessonCover(lessonIndex[0]), label: "", alt: "" } } as CatalogLesson,
    document: null as LessonContent["document"],
    guideSections: [] as GuideSection[],
    characters: [] as ViewCharacter[],
    wordGroups: [] as ViewWordGroup[],
    extensionCharacters: [] as ViewCharacter[],
    extensionWordGroups: [] as ViewWordGroup[],
    practiceItems: [] as PracticeItem[],
    lessonSceneSrc: lessonCover(lessonIndex[0]),
    activeView: "guide" as "guide" | "words" | "practice",
    loading: true,
    error: "",
    completed: 0,
    total: 0,
    percent: 0,
    mobileIndexOpen: false,
    highlightedSectionId: "",
    navTop: 0,
    navHeight: 52,
    capsuleInset: 0,
  },
  onLoad(options: Record<string, string | undefined>) {
    const lessonId = options.lessonId || lessonIndex[0].id;
    const summary = lessonIndex.find((lesson) => lesson.id === lessonId) ?? lessonIndex[0];
    const activeView = options.view === "words" || options.view === "practice" ? options.view : "guide";
    this.setData({
      lessonId: summary.id,
      lesson: { ...summary, visual: { src: lessonCover(summary), label: summary.title, alt: summary.title } },
      activeView,
      ...navigationLayout(),
    });
    void this.loadLesson();
  },
  onShow() {
    this.setData({ theme: loadProfile().theme });
    if (!this.data.loading && this.data.characters.length) this.applyProgress();
    this.showPendingGuideAnchor();
  },
  onUnload() {
    if (guideHighlightTimer !== null) clearTimeout(guideHighlightTimer);
    guideHighlightTimer = null;
    pendingGuideSectionId = "";
  },
  async onPullDownRefresh() {
    await this.loadLesson(true);
    wx.stopPullDownRefresh();
  },
  async loadLesson(refresh = false) {
    this.setData({ loading: true, error: "" });
    try {
      const content = await getLessonContent(this.data.lessonId, refresh);
      const viewCharacters = content.characters
        .filter((character) => character.ready && character.primary)
        .map(decorateCharacter);
      const extensionCharacters = viewCharacters.filter((character) => character.official === false || character.tier === "extension");
      const coreCharacters = viewCharacters.filter(isCoreCharacter);
      const paragraphWords = [...new Set(coreCharacters.map((character) => character.word))];
      const characterByHanzi = new Map(coreCharacters.map((character) => [character.hanzi, character]));
      const seenCharacterIds = new Set<string>();
      let paragraphIndex = 0;
      const guideSections = (content.document?.sections ?? []).map((section, sectionIndex) => {
        const seen = new Set<string>();
        const focusCharacters = (section.focusWords ?? []).flatMap((word) => coreCharacters.filter((character) =>
          character.word === word
        )).filter((character) => {
          if (seen.has(character.id)) return false;
          seen.add(character.id);
          return true;
        });
        const paragraphs = section.paragraphs.map((paragraph) => decorateGuideParagraph(
          paragraph,
          paragraphIndex++,
          paragraphWords,
          characterByHanzi,
          seenCharacterIds,
        ));
        return {
          ...section,
          id: section.id ?? `lesson-section-${sectionIndex + 1}`,
          paragraphs,
          focusCharacters,
          focusWordItems: decorateFocusWords(section.focusWords ?? [], coreCharacters),
        };
      });
      const sectionByCharacterId = new Map<string, string>();
      for (const section of guideSections) {
        for (const character of section.focusCharacters) {
          if (!sectionByCharacterId.has(character.id)) sectionByCharacterId.set(character.id, section.id);
        }
      }
      const fallbackSectionId = guideSections[0]?.id ?? "";
      const characters = coreCharacters.map((character) => ({
          ...character,
          guideSectionId: sectionByCharacterId.get(character.id) ?? fallbackSectionId,
        }));
      this.setData({
        lesson: content.lesson,
        document: content.document,
        guideSections,
        characters,
        wordGroups: groupCharactersByWord(characters),
        extensionCharacters,
        extensionWordGroups: groupCharactersByWord(extensionCharacters),
        practiceItems: progressItems(characters),
        lessonSceneSrc: lessonCover(content.lesson),
        loading: false,
      });
      this.applyProgress();
    } catch (error) {
      this.setData({ loading: false, error: error instanceof Error ? error.message : "课程加载失败" });
    }
  },
  applyProgress() {
    const profile = loadProfile();
    const completedIds = new Set(profile.completed.words);
    const characters = this.data.characters.map((character) => ({ ...character, done: completedIds.has(character.id) }));
    const extensionCharacters = this.data.extensionCharacters.map((character) => ({ ...character, done: completedIds.has(character.id) }));
    const guideSections = this.data.guideSections.map((section) => ({
      ...section,
      focusCharacters: section.focusCharacters.map((character) => ({ ...character, done: completedIds.has(character.id) })),
      paragraphs: section.paragraphs.map((paragraph) => ({
        ...paragraph,
        segments: paragraph.segments.map((segment) => ({
          ...segment,
          done: Boolean(segment.targetId) && completedIds.has(segment.targetId),
        })),
      })),
      focusWordItems: section.focusWordItems.map((word) => ({
        ...word,
        glyphs: word.glyphs.map((glyph) => ({
          ...glyph,
          done: Boolean(glyph.targetId) && completedIds.has(glyph.targetId),
        })),
        done: word.targetIds.length > 0 && word.targetIds.every((id) => completedIds.has(id)),
      })),
    }));
    const wordGroups = groupCharactersByWord(characters);
    const extensionWordGroups = groupCharactersByWord(extensionCharacters);
    const completed = characters.filter((character) => character.done).length;
    this.setData({
      characters,
      extensionCharacters,
      guideSections,
      wordGroups,
      extensionWordGroups,
      practiceItems: progressItems(characters),
      completed,
      total: characters.length,
      percent: characters.length ? Math.round(completed / characters.length * 100) : 0,
    });
  },
  retry() { void this.loadLesson(true); },
  goBack() { wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/lessons/index" }) }); },
  switchView(event: WechatMiniprogram.BaseEvent) {
    this.setData({
      activeView: event.currentTarget.dataset.view as "guide" | "words" | "practice",
      mobileIndexOpen: false,
      highlightedSectionId: "",
    });
    wx.pageScrollTo({ scrollTop: 0, duration: 180 });
  },
  openCharacter(event: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/character/index?lessonId=${this.data.lessonId}&characterId=${event.currentTarget.dataset.id}` });
  },
  toggleMobileIndex() {
    this.setData({ mobileIndexOpen: !this.data.mobileIndexOpen });
  },
  openIndexedCharacter(event: WechatMiniprogram.BaseEvent) {
    pendingGuideSectionId = String(event.currentTarget.dataset.sectionId ?? "");
    this.setData({ mobileIndexOpen: false });
    this.openCharacter(event);
  },
  showPendingGuideAnchor() {
    if (!pendingGuideSectionId || this.data.activeView !== "guide") return;
    const sectionId = pendingGuideSectionId;
    pendingGuideSectionId = "";
    if (guideHighlightTimer !== null) clearTimeout(guideHighlightTimer);
    this.setData({ highlightedSectionId: "" });
    wx.nextTick(() => {
      this.setData({ highlightedSectionId: sectionId });
      wx.pageScrollTo({
        selector: `#guide-section-${sectionId}`,
        offsetTop: -118,
        duration: 220,
      });
      guideHighlightTimer = setTimeout(() => {
        guideHighlightTimer = null;
        this.setData({ highlightedSectionId: "" });
      }, 1_200);
    });
  },
  startPractice(event?: WechatMiniprogram.BaseEvent) {
    const track = (event?.currentTarget.dataset.track ?? "words") as TrackId;
    const profile = loadProfile();
    if (track !== "words") {
      wx.navigateTo({ url: `/pages/track/index?track=${track}&lessonId=${this.data.lessonId}` });
      return;
    }
    if (track === "words" && this.data.characters.length > 0 && this.data.characters.every((character) => profile.completed.words.includes(character.id))) {
      this.setData({ activeView: "words" });
      wx.pageScrollTo({ scrollTop: 0, duration: 180 });
      return;
    }
    const candidates = this.data.characters;
    if (!candidates.length) {
      wx.showToast({ title: "请先完成本课单字过关", icon: "none" });
      return;
    }
    const first = candidates.find((character) => !profile.completed[track].includes(character.id)) ?? candidates[0];
    wx.navigateTo({ url: `/pages/practice/index?track=${track}&lessonId=${this.data.lessonId}${first ? `&characterId=${first.id}` : ""}` });
  },
});
