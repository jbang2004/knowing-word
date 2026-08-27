import { characterIndex, isCoreCharacter, lessonIndex } from "../../services/catalog";
import { navigationLayout } from "../../services/layout";
import { loadProfile, syncProfile } from "../../services/profile";
import type { StudyProfile, TrackId } from "../../types/models";

const trackMeta: Array<{ id: TrackId; glyph: string; eyebrow: string; label: string; tone: string }> = [
  { id: "words", glyph: "字", eyebrow: "一次完成这个字的完整过关", label: "词语表与写字表", tone: "action" },
  { id: "structure", glyph: "构", eyebrow: "不牢时，像搭积木一样再看汉字", label: "结构复习", tone: "wrong" },
  { id: "split", glyph: "拆", eyebrow: "不牢时，拆一拆再写一写", label: "拆字复习", tone: "part" },
  { id: "honglan", glyph: "红蓝", eyebrow: "不牢时，再分清部首与其他部件", label: "红蓝复习", tone: "radical" },
];

function makeView(profile: StudyProfile) {
  const ready = characterIndex.filter(isCoreCharacter);
  const completedWords = new Set(profile.completed.words);
  const nextCharacter = ready.find((character) => !completedWords.has(character.id)) ?? ready[0];
  const lesson = lessonIndex.find((item) => item.id === nextCharacter?.lessonId) ?? lessonIndex[0];
  const lessonCharacters = ready.filter((character) => character.lessonId === lesson.id);
  const learnedLessonCharacters = lessonCharacters.filter((character) => completedWords.has(character.id));
  const learnedAll = ready.filter((character) => completedWords.has(character.id));
  const routes = trackMeta.map((track, index) => {
    const lessonPool = track.id === "words" ? lessonCharacters : learnedLessonCharacters;
    const allPool = track.id === "words" ? ready : learnedAll;
    const completed = new Set(profile.completed[track.id]);
    return {
      ...track,
      number: String(index + 1).padStart(2, "0"),
      lessonCompleted: lessonPool.filter((character) => completed.has(character.id)).length,
      lessonTotal: lessonPool.length,
      totalCompleted: allPool.filter((character) => completed.has(character.id)).length,
      total: allPool.length,
      action: track.id === "words" ? "学习本课" : lessonPool.length ? "继续本课" : "先学本课生字",
    };
  });
  return {
    lesson,
    nextCharacter,
    lessonCompleted: learnedLessonCharacters.length,
    lessonTotal: lessonCharacters.length,
    routes,
  };
}

Page({
  data: {
    ...makeView(loadProfile()),
    theme: loadProfile().theme,
    contentTop: 70,
  },
  onLoad() {
    this.setData(navigationLayout());
  },
  onShow() {
    const profile = loadProfile();
    this.getTabBar?.()?.setData({ selected: 2, theme: profile.theme });
    this.setData({ ...makeView(profile), theme: profile.theme });
  },
  async onPullDownRefresh() {
    this.setData(makeView(await syncProfile()));
    wx.stopPullDownRefresh();
  },
  continueRecommended() {
    const character = this.data.nextCharacter;
    wx.navigateTo({
      url: `/pages/practice/index?track=words&lessonId=${this.data.lesson.id}${character ? `&characterId=${character.id}` : ""}`,
    });
  },
  openRoute(event: WechatMiniprogram.BaseEvent) {
    const track = event.currentTarget.dataset.track as TrackId;
    if (track !== "words" && this.data.lessonCompleted === 0) {
      wx.navigateTo({ url: `/pages/lesson/index?lessonId=${this.data.lesson.id}` });
      return;
    }
    wx.navigateTo({ url: `/pages/practice/index?track=${track}&lessonId=${this.data.lesson.id}` });
  },
  openLessons() {
    wx.switchTab({ url: "/pages/lessons/index" });
  },
  openReader() {
    wx.navigateTo({ url: `/pages/reader/index?lessonId=${this.data.lesson.id}` });
  },
});
