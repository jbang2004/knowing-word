import { getLessonContent, isCoreCharacter, lessonCover, lessonIndex } from "../../services/catalog";
import { navigationLayout } from "../../services/layout";
import { loadProfile } from "../../services/profile";
import type { CatalogCharacter, CatalogLesson, LessonContent, TrackId } from "../../types/models";

type ViewCharacter = CatalogCharacter & { done: boolean; roleLabel: string };
type GuideSection = NonNullable<LessonContent["document"]>["sections"][number] & { focusCharacters: ViewCharacter[] };
type ViewWordGroup = { word: string; characters: ViewCharacter[] };

function groupCharactersByWord(characters: ViewCharacter[]) {
  const groups = new Map<string, ViewCharacter[]>();
  for (const character of characters) {
    groups.set(character.word, [...(groups.get(character.word) ?? []), character]);
  }
  return [...groups].map(([word, items]) => ({ word, characters: items }));
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
    lessonSceneSrc: lessonCover(lessonIndex[0]),
    activeView: "guide" as "guide" | "words" | "practice",
    loading: true,
    error: "",
    completed: 0,
    total: 0,
    percent: 0,
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
  },
  async onPullDownRefresh() {
    await this.loadLesson(true);
    wx.stopPullDownRefresh();
  },
  async loadLesson(refresh = false) {
    this.setData({ loading: true, error: "" });
    try {
      const content = await getLessonContent(this.data.lessonId, refresh);
      const characters = content.characters
        .filter(isCoreCharacter)
        .map((character) => ({
          ...character,
          done: false,
          roleLabel: character.curriculumRole === "write" ? "会写" : character.curriculumRole === "recognize" ? "会认" : character.curriculumRole === "polyphonic" ? "多音字" : "拓展",
        }));
      const guideSections = (content.document?.sections ?? []).map((section) => {
        const seen = new Set<string>();
        const focusCharacters = (section.focusWords ?? []).flatMap((word) => characters.filter((character) =>
          word.includes(character.hanzi) || character.word === word
        )).filter((character) => {
          if (seen.has(character.id)) return false;
          seen.add(character.id);
          return true;
        });
        return { ...section, focusCharacters };
      });
      this.setData({
        lesson: content.lesson,
        document: content.document,
        guideSections,
        characters,
        wordGroups: groupCharactersByWord(characters),
        lessonSceneSrc: lessonCover(content.lesson),
        loading: false,
      });
      this.applyProgress();
    } catch (error) {
      this.setData({ loading: false, error: error instanceof Error ? error.message : "课程加载失败" });
    }
  },
  applyProgress() {
    const completedIds = new Set(loadProfile().completed.words);
    const characters = this.data.characters.map((character) => ({ ...character, done: completedIds.has(character.id) }));
    const guideSections = this.data.guideSections.map((section) => ({
      ...section,
      focusCharacters: section.focusCharacters.map((character) => ({ ...character, done: completedIds.has(character.id) })),
    }));
    const wordGroups = groupCharactersByWord(characters);
    const completed = characters.filter((character) => character.done).length;
    this.setData({ characters, guideSections, wordGroups, completed, total: characters.length, percent: characters.length ? Math.round(completed / characters.length * 100) : 0 });
  },
  retry() { void this.loadLesson(true); },
  goBack() { wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/lessons/index" }) }); },
  switchView(event: WechatMiniprogram.BaseEvent) {
    this.setData({ activeView: event.currentTarget.dataset.view as "guide" | "words" | "practice" });
    wx.pageScrollTo({ scrollTop: 0, duration: 180 });
  },
  openCharacter(event: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/character/index?lessonId=${this.data.lessonId}&characterId=${event.currentTarget.dataset.id}` });
  },
  startPractice(event?: WechatMiniprogram.BaseEvent) {
    const track = (event?.currentTarget.dataset.track ?? "words") as TrackId;
    const first = this.data.characters.find((character) => !character.done) ?? this.data.characters[0];
    wx.navigateTo({ url: `/pages/practice/index?track=${track}&lessonId=${this.data.lessonId}${first ? `&characterId=${first.id}` : ""}` });
  },
});
