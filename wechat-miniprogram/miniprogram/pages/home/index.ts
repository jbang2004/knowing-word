import { characterIndex, lessonCover, lessonIndex } from "../../services/catalog";
import { learningDayKey, loadProfile, syncProfile } from "../../services/profile";
import type { StudyProfile, TrackId } from "../../types/models";

const trackDetails: Array<{ id: TrackId; glyph: string; title: string; copy: string }> = [
  { id: "words", glyph: "字", title: "完整识字", copy: "字义、字形与书写连续过关" },
  { id: "split", glyph: "拆", title: "拆字复习", copy: "找部件，再把字搭回来" },
  { id: "honglan", glyph: "红蓝", title: "部首辨认", copy: "分清表意部首与其他部件" },
  { id: "structure", glyph: "构", title: "结构复习", copy: "看清左右、上下与包围关系" },
];

function makeView(profile: StudyProfile) {
  const readyCharacters = characterIndex.filter((character) => character.ready);
  const completedWords = new Set(profile.completed.words);
  const nextCharacter = readyCharacters.find((character) => !completedWords.has(character.id)) ?? readyCharacters[0];
  const nextLesson = lessonIndex.find((lesson) => lesson.id === nextCharacter?.lessonId) ?? lessonIndex[0];
  const lessonCharacters = readyCharacters.filter((character) => character.lessonId === nextLesson.id);
  const lessonCompleted = lessonCharacters.filter((character) => completedWords.has(character.id)).length;
  const today = profile.daily[learningDayKey()] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
  return {
    name: profile.name || "小探险家",
    today,
    nextCharacter,
    nextLesson: { ...nextLesson, cover: lessonCover(nextLesson) },
    lessonCompleted,
    lessonTotal: lessonCharacters.length,
    lessonProgress: lessonCharacters.length ? Math.round(lessonCompleted / lessonCharacters.length * 100) : 0,
    tracks: trackDetails.map((track) => ({
      ...track,
      completed: profile.completed[track.id].length,
      total: readyCharacters.length,
      percent: readyCharacters.length
        ? Math.round(profile.completed[track.id].length / readyCharacters.length * 100)
        : 0,
    })),
  };
}

Page({
  data: {
    name: "小探险家",
    today: { attempts: 0, correct: 0, skips: 0, readSessions: 0 },
    nextCharacter: null as typeof characterIndex[number] | null,
    nextLesson: { ...lessonIndex[0], cover: lessonCover(lessonIndex[0]) },
    lessonCompleted: 0,
    lessonTotal: 0,
    lessonProgress: 0,
    tracks: [] as ReturnType<typeof makeView>["tracks"],
  },
  onShow() {
    this.setData(makeView(loadProfile()));
  },
  async onPullDownRefresh() {
    const profile = await syncProfile();
    this.setData(makeView(profile));
    wx.stopPullDownRefresh();
  },
  openLesson() {
    wx.navigateTo({ url: `/pages/lesson/index?lessonId=${this.data.nextLesson.id}` });
  },
  continueLearning() {
    const characterId = this.data.nextCharacter?.id;
    wx.navigateTo({
      url: `/pages/practice/index?track=words&lessonId=${this.data.nextLesson.id}${characterId ? `&characterId=${characterId}` : ""}`,
    });
  },
  openTrack(event: WechatMiniprogram.BaseEvent) {
    const track = event.currentTarget.dataset.track as TrackId;
    wx.navigateTo({ url: `/pages/practice/index?track=${track}&lessonId=${this.data.nextLesson.id}` });
  },
});
