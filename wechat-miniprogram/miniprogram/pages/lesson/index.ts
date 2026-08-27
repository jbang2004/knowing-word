import { charactersForLesson, getLessonContent, lessonCover, lessonIndex } from "../../services/catalog";
import { loadProfile } from "../../services/profile";
import type { CatalogLesson, LessonContent } from "../../types/models";

Page({
  data: {
    lessonId: lessonIndex[0].id,
    lesson: { ...lessonIndex[0], visual: { src: lessonCover(lessonIndex[0]), label: "", alt: "" } } as CatalogLesson,
    characters: [] as Array<LessonContent["characters"][number] & { done: boolean; roleLabel: string }>,
    loading: true,
    error: "",
    completed: 0,
    total: 0,
    percent: 0,
  },
  onLoad(options: Record<string, string | undefined>) {
    const lessonId = options.lessonId || lessonIndex[0].id;
    const summary = lessonIndex.find((lesson) => lesson.id === lessonId) ?? lessonIndex[0];
    this.setData({ lessonId: summary.id, lesson: { ...summary, visual: { src: lessonCover(summary), label: summary.title, alt: summary.title } } });
    void this.loadLesson();
  },
  onShow() {
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
      const characters = content.characters.map((character) => ({
        ...character,
        done: false,
        roleLabel: character.curriculumRole === "write" ? "会写" : character.curriculumRole === "recognize" ? "会认" : character.curriculumRole === "polyphonic" ? "多音字" : "拓展",
      }));
      wx.setNavigationBarTitle({ title: `第 ${content.lesson.position} 课 · ${content.lesson.title}` });
      this.setData({ lesson: content.lesson, characters, loading: false });
      this.applyProgress();
    } catch (error) {
      this.setData({ loading: false, error: error instanceof Error ? error.message : "课程加载失败" });
    }
  },
  applyProgress() {
    const completedIds = new Set(loadProfile().completed.words);
    const characters = this.data.characters.map((character) => ({ ...character, done: completedIds.has(character.id) }));
    const completed = characters.filter((character) => character.done).length;
    this.setData({
      characters,
      completed,
      total: characters.length,
      percent: characters.length ? Math.round(completed / characters.length * 100) : 0,
    });
  },
  retry() { void this.loadLesson(true); },
  openCharacter(event: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/character/index?lessonId=${this.data.lessonId}&characterId=${event.currentTarget.dataset.id}` });
  },
  startPractice() {
    const first = this.data.characters.find((character) => !character.done) ?? this.data.characters[0];
    wx.navigateTo({ url: `/pages/practice/index?track=words&lessonId=${this.data.lessonId}${first ? `&characterId=${first.id}` : ""}` });
  },
  openReader() { wx.navigateTo({ url: `/pages/reader/index?lessonId=${this.data.lessonId}` }); },
});
