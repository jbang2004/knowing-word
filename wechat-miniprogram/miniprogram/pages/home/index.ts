import { characterIndex, isCoreCharacter, lessonCover, lessonIndex } from "../../services/catalog";
import { navigationLayout } from "../../services/layout";
import { learningDayKey, loadProfile, syncProfile } from "../../services/profile";
import type { StudyProfile, TrackId } from "../../types/models";

const trackDetails: Array<{ id: TrackId; glyph: string; title: string; copy: string }> = [
  { id: "words", glyph: "字", title: "完整识字", copy: "字义、字形与书写连续过关" },
  { id: "structure", glyph: "构", title: "结构复习", copy: "看清左右、上下与包围关系" },
  { id: "split", glyph: "拆", title: "拆字复习", copy: "找部件，再把字搭回来" },
  { id: "honglan", glyph: "红蓝", title: "红蓝复习", copy: "分清表意部首与其他部件" },
];

const segmentMeta = [
  { numeral: "一", title: "从词语认字", copy: "先听懂字义，再辨认完整字形" },
  { numeral: "二", title: "看清字形", copy: "观察结构和部件，建立记忆线索" },
  { numeral: "三", title: "独立回想", copy: "离开提示，再把这个字想起来" },
];

function makePathSegments(
  lessonCharacters: typeof characterIndex,
  completedWords: Set<string>,
  nextCharacterId?: string,
) {
  const segmentSize = Math.max(1, Math.ceil(lessonCharacters.length / segmentMeta.length));
  return segmentMeta.map((meta, segmentIndex) => {
    const characters = lessonCharacters
      .slice(segmentIndex * segmentSize, (segmentIndex + 1) * segmentSize)
      .map((character, index) => ({
        ...character,
        state: completedWords.has(character.id)
          ? "done"
          : character.id === nextCharacterId
            ? "current"
            : "locked",
        offsetClass: ["offset-0", "offset-1", "offset-2", "offset-3"][index % 4],
      }));
    const hasCurrent = characters.some((character) => character.state === "current");
    const allDone = characters.length > 0 && characters.every((character) => character.state === "done");
    return {
      ...meta,
      characters,
      preview: characters.slice(0, 4).map((character) => character.hanzi),
      state: hasCurrent ? "current" : allDone ? "done" : "locked",
    };
  }).filter((segment) => segment.characters.length > 0);
}

function currentStreak(daily: StudyProfile["daily"]) {
  const active = new Set(Object.keys(daily).filter((day) => {
    const item = daily[day];
    return item && item.attempts + item.readSessions > 0;
  }));
  let streak = 0;
  const cursor = new Date();
  while (active.has(learningDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function dueTimestamp(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return Number.POSITIVE_INFINITY;
  const dimensions = Object.values(value as Record<string, unknown>);
  return dimensions.reduce<number>((earliest, dimension) => {
    if (!dimension || typeof dimension !== "object" || Array.isArray(dimension)) return earliest;
    const state = dimension as { status?: unknown; dueAt?: unknown };
    if (state.status === "new" || typeof state.dueAt !== "string") return earliest;
    const timestamp = Date.parse(state.dueAt);
    return Number.isNaN(timestamp) ? earliest : Math.min(earliest, timestamp);
  }, Number.POSITIVE_INFINITY);
}

function makeView(profile: StudyProfile) {
  const readyCharacters = characterIndex.filter(isCoreCharacter);
  const completedWords = new Set(profile.completed.words);
  const nextCharacter = readyCharacters.find((character) => !completedWords.has(character.id)) ?? readyCharacters[0];
  const nextLesson = lessonIndex.find((lesson) => lesson.id === nextCharacter?.lessonId) ?? lessonIndex[0];
  const lessonCharacters = readyCharacters.filter((character) => character.lessonId === nextLesson.id);
  const lessonCompleted = lessonCharacters.filter((character) => completedWords.has(character.id)).length;
  const today = profile.daily[learningDayKey()] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
  const reviewedToday = new Set(profile.reviewedByDay[learningDayKey()] ?? []);
  const dueCharacters = readyCharacters
    .filter((character) => completedWords.has(character.id) && !reviewedToday.has(character.id))
    .map((character) => ({ character, dueAt: dueTimestamp(profile.memory[character.id]) }))
    .filter((item) => item.dueAt <= Date.now())
    .sort((left, right) => left.dueAt - right.dueAt);
  const allWordsComplete = lessonCharacters.length > 0 && lessonCompleted === lessonCharacters.length;
  const reviewTracks = trackDetails.slice(1).map((track) => {
    const completed = new Set(profile.completed[track.id]);
    const completedCount = lessonCharacters.filter((character) => completed.has(character.id)).length;
    const total = lessonCharacters.length;
    const complete = total > 0 && completedCount >= total;
    return {
      ...track,
      completed: completedCount,
      total,
      state: !allWordsComplete ? "locked" : complete ? "complete" : "available",
      progressLabel: allWordsComplete
        ? `${completedCount} / ${total} 已通关`
        : "学完本课生字后解锁",
    };
  });
  return {
    name: profile.name || "小探险家",
    initial: (profile.name || "小").slice(0, 1),
    today,
    nextCharacter,
    nextLesson: { ...nextLesson, cover: lessonCover(nextLesson) },
    lessonCompleted,
    lessonTotal: lessonCharacters.length,
    lessonProgress: lessonCharacters.length ? Math.round(lessonCompleted / lessonCharacters.length * 100) : 0,
    allWordsComplete,
    allReviewsComplete: allWordsComplete && reviewTracks.every((track) => track.state === "complete"),
    readCompleted: profile.readLessons.includes(nextLesson.id),
    practiceStatus: allWordsComplete
      ? "本课生字已经学完"
      : `完成 ${lessonCompleted}/${lessonCharacters.length} 个识字小测后解锁`,
    streak: currentStreak(profile.daily),
    dueReview: dueCharacters[0]?.character ?? null,
    dueReviewCount: dueCharacters.length,
    pathSegments: makePathSegments(lessonCharacters, completedWords, nextCharacter?.id),
    tracks: trackDetails.map((track) => ({
      ...track,
      completed: profile.completed[track.id].length,
      total: readyCharacters.length,
      percent: readyCharacters.length
        ? Math.round(profile.completed[track.id].length / readyCharacters.length * 100)
        : 0,
    })),
    reviewTracks,
  };
}

Page({
  data: {
    theme: loadProfile().theme,
    pageMotion: "page-arrive-a",
    name: "小探险家",
    initial: "小",
    today: { attempts: 0, correct: 0, skips: 0, readSessions: 0 },
    nextCharacter: null as typeof characterIndex[number] | null,
    nextLesson: { ...lessonIndex[0], cover: lessonCover(lessonIndex[0]) },
    lessonCompleted: 0,
    lessonTotal: 0,
    lessonProgress: 0,
    allWordsComplete: false,
    allReviewsComplete: false,
    readCompleted: false,
    practiceStatus: "完成识字小测后解锁",
    streak: 0,
    dueReview: null as typeof characterIndex[number] | null,
    dueReviewCount: 0,
    navTop: 0,
    navHeight: 52,
    capsuleInset: 0,
    pathSegments: [] as ReturnType<typeof makeView>["pathSegments"],
    tracks: [] as ReturnType<typeof makeView>["tracks"],
    reviewTracks: trackDetails.slice(1),
  },
  onLoad() {
    this.setData(navigationLayout());
  },
  onShow() {
    const profile = loadProfile();
    this.getTabBar?.()?.setData({ selected: 0, theme: profile.theme });
    this.setData({
      ...makeView(profile),
      theme: profile.theme,
      pageMotion: this.data.pageMotion === "page-arrive-a" ? "page-arrive-b" : "page-arrive-a",
    });
  },
  async onPullDownRefresh() {
    const profile = await syncProfile();
    this.setData(makeView(profile));
    wx.stopPullDownRefresh();
  },
  openLesson() {
    wx.navigateTo({ url: `/pages/lesson/index?lessonId=${this.data.nextLesson.id}` });
  },
  openAccount() {
    wx.switchTab({ url: "/pages/account/index" });
  },
  openPathCharacter(event: WechatMiniprogram.BaseEvent) {
    const state = event.currentTarget.dataset.state as string;
    if (state === "locked") {
      wx.showToast({ title: "先完成前一个字", icon: "none" });
      return;
    }
    const characterId = event.currentTarget.dataset.id as string;
    wx.navigateTo({
      url: `/pages/practice/index?track=words&lessonId=${this.data.nextLesson.id}&characterId=${characterId}`,
    });
  },
  continueLearning() {
    const characterId = this.data.nextCharacter?.id;
    wx.navigateTo({
      url: `/pages/practice/index?track=words&lessonId=${this.data.nextLesson.id}${characterId ? `&characterId=${characterId}` : ""}`,
    });
  },
  reviewDue() {
    const character = this.data.dueReview;
    if (!character) return;
    wx.navigateTo({
      url: `/pages/practice/index?track=words&lessonId=${character.lessonId}&characterId=${character.id}&review=due`,
    });
  },
  openTrack(event: WechatMiniprogram.BaseEvent) {
    const track = event.currentTarget.dataset.track as TrackId;
    const state = event.currentTarget.dataset.state as string;
    if (!this.data.allWordsComplete || state === "locked") {
      wx.showToast({ title: "学完本课生字后解锁", icon: "none" });
      return;
    }
    wx.navigateTo({ url: `/pages/track/index?track=${track}&lessonId=${this.data.nextLesson.id}` });
  },
  openReader() {
    if (!this.data.allWordsComplete) {
      wx.showToast({ title: "学完本课生字后解锁", icon: "none" });
      return;
    }
    wx.navigateTo({ url: `/pages/reader/index?lessonId=${this.data.nextLesson.id}` });
  },
});
