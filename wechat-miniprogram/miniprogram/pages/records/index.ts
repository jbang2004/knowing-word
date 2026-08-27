import { characterIndex, isCoreCharacter, lessonIndex } from "../../services/catalog";
import { navigationLayout } from "../../services/layout";
import { loadProfile, syncProfile } from "../../services/profile";
import type { StudyProfile, TrackId } from "../../types/models";

const trackLabels: Record<TrackId, string> = {
  words: "识字",
  split: "拆字复习",
  honglan: "红蓝复习",
  structure: "结构复习",
};
const trackIds = Object.keys(trackLabels) as TrackId[];

function formatDate(value: string) {
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function recordView(profile: StudyProfile, track: TrackId, showAllLessons = false) {
  const candidates = characterIndex.filter(isCoreCharacter);
  const candidateIds = new Set(candidates.map((character) => character.id));
  const answersByCharacter = new Map<string, Array<StudyProfile["answers"][string]>>();
  const marker = `-${track}-`;

  for (const [questionId, answer] of Object.entries(profile.answers)) {
    const markerIndex = questionId.indexOf(marker);
    if (markerIndex < 0) continue;
    const characterId = questionId.slice(0, markerIndex);
    if (!candidateIds.has(characterId)) continue;
    answersByCharacter.set(characterId, [...(answersByCharacter.get(characterId) ?? []), answer]);
  }

  const allAnswers = [...answersByCharacter.values()].flat();
  const attempts = allAnswers.reduce((sum, answer) => sum + answer.attempts, 0);
  const correct = allAnswers.reduce((sum, answer) => sum + answer.correct, 0);
  const completedIds = new Set(profile.completed[track]);
  const recent = candidates
    .map((character) => {
      const answers = answersByCharacter.get(character.id) ?? [];
      const latestAt = answers.reduce((latest, answer) => answer.lastAt > latest ? answer.lastAt : latest, "");
      return {
        id: character.id,
        lessonId: character.lessonId,
        hanzi: character.hanzi,
        status: completedIds.has(character.id) ? "已完成" : "正在练习",
        attempts: answers.reduce((sum, answer) => sum + answer.attempts, 0),
        latestAt,
        dateText: latestAt ? formatDate(latestAt) : "",
      };
    })
    .filter((item) => item.latestAt)
    .sort((left, right) => right.latestAt.localeCompare(left.latestAt))
    .slice(0, 6);

  const allLessons = lessonIndex.map((lesson) => {
    const lessonCandidates = candidates.filter((character) => character.lessonId === lesson.id);
    const recorded = lessonCandidates.filter((character) => answersByCharacter.has(character.id)).map((character) => ({
      id: character.id,
      lessonId: lesson.id,
      hanzi: character.hanzi,
      status: completedIds.has(character.id) ? "已完成" : "正在练习",
      attempts: (answersByCharacter.get(character.id) ?? []).reduce((sum, answer) => sum + answer.attempts, 0),
    }));
    const completed = lessonCandidates.filter((character) => completedIds.has(character.id)).length;
    return { id: lesson.id, title: lesson.title, position: lesson.position, completed, total: lessonCandidates.length, recorded, active: recorded.length > 0 || completed > 0 };
  });
  const activeLessons = allLessons.filter((lesson) => lesson.active);
  const visibleLessons = showAllLessons ? allLessons : activeLessons;

  return {
    activeTrack: track,
    activeTrackLabel: trackLabels[track],
    tracks: trackIds.map((id) => ({ id, label: trackLabels[id], active: id === track })),
    completed: profile.completed[track].length,
    attempts,
    correct,
    recent,
    recentCount: recent.length,
    activeLessonCount: activeLessons.length,
    allLessonCount: allLessons.length,
    showAllLessons,
    visibleLessons,
    hasLessons: visibleLessons.length > 0,
  };
}

Page({
  data: { contentTop: 70, ...recordView(loadProfile(), "words") },
  onLoad() {
    this.setData(navigationLayout(10));
  },
  onShow() {
    this.setData(recordView(loadProfile(), this.data.activeTrack, this.data.showAllLessons));
  },
  async onPullDownRefresh() {
    const profile = await syncProfile();
    this.setData(recordView(profile, this.data.activeTrack, this.data.showAllLessons));
    wx.stopPullDownRefresh();
  },
  goBack() { wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/account/index" }) }); },
  switchTrack(event: WechatMiniprogram.BaseEvent) {
    const track = event.currentTarget.dataset.id as TrackId;
    this.setData(recordView(loadProfile(), track, false));
  },
  toggleAllLessons() {
    this.setData(recordView(loadProfile(), this.data.activeTrack, !this.data.showAllLessons));
  },
  openCharacter(event: WechatMiniprogram.BaseEvent) {
    const { id, lessonId } = event.currentTarget.dataset as { id: string; lessonId: string };
    wx.navigateTo({ url: `/pages/character/index?lessonId=${lessonId}&characterId=${id}` });
  },
  startPractice() {
    const candidate = characterIndex.find((character) => character.ready && character.primary);
    if (!candidate) return;
    wx.navigateTo({ url: `/pages/practice/index?track=${this.data.activeTrack}&lessonId=${candidate.lessonId}&characterId=${candidate.id}` });
  },
});
