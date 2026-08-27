import { getLessonContent, isCoreCharacter, lessonCover, lessonIndex } from "../../services/catalog";
import { navigationLayout } from "../../services/layout";
import { loadProfile } from "../../services/profile";
import type { CatalogCharacter, CatalogLesson, LessonContent, TrackId } from "../../types/models";

type ViewCharacter = CatalogCharacter & { done: boolean; roleLabel: string; guideSectionId?: string };
type GuideSection = Omit<NonNullable<LessonContent["document"]>["sections"][number], "id"> & { id: string; focusCharacters: ViewCharacter[] };
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
      const guideSections = (content.document?.sections ?? []).map((section, sectionIndex) => {
        const seen = new Set<string>();
        const focusCharacters = (section.focusWords ?? []).flatMap((word) => viewCharacters.filter((character) =>
          word.includes(character.hanzi) || character.word === word
        )).filter((character) => {
          if (seen.has(character.id)) return false;
          seen.add(character.id);
          return true;
        });
        return { ...section, id: section.id ?? `lesson-section-${sectionIndex + 1}`, focusCharacters };
      });
      const sectionByCharacterId = new Map<string, string>();
      for (const section of guideSections) {
        for (const character of section.focusCharacters) {
          if (!sectionByCharacterId.has(character.id)) sectionByCharacterId.set(character.id, section.id);
        }
      }
      const fallbackSectionId = guideSections[0]?.id ?? "";
      const characters = viewCharacters
        .filter(isCoreCharacter)
        .map((character) => ({
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
