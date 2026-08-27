import { characterIndex, isCoreCharacter, lessonIndex } from "../../services/catalog";
import { navigationLayout } from "../../services/layout";
import { loadProfile } from "../../services/profile";
import type { StudyProfile, TrackId } from "../../types/models";

type SpecialistTrack = Exclude<TrackId, "words">;

const meta: Record<SpecialistTrack, {
  label: string;
  menu: string;
  glyph: string;
  tone: string;
  eyebrow: string;
  copy: string;
  action: string;
}> = {
  structure: {
    label: "结构复习",
    menu: "结构复习",
    glyph: "构",
    tone: "wrong",
    eyebrow: "不牢时，像搭积木一样再看汉字",
    copy: "这是选做复习：左右、上下、包围……先看部件怎样站位，再选出正确的空间结构。",
    action: "继续结构复习",
  },
  split: {
    label: "拆字复习",
    menu: "拆字复习",
    glyph: "拆",
    tone: "part",
    eyebrow: "不牢时，拆一拆再写一写",
    copy: "这是选做复习：把汉字拆成部首和部件，自己搭回去，再落笔写完整的字。",
    action: "继续拆字复习",
  },
  honglan: {
    label: "红蓝复习",
    menu: "红蓝复习",
    glyph: "红蓝",
    tone: "radical",
    eyebrow: "不牢时，再分清部首与其他部件",
    copy: "这是选做复习：让表意的部首和其他部件穿上不同颜色，建立字形的颜色记忆。",
    action: "继续红蓝复习",
  },
};

function buildTrackView(profile: StudyProfile, track: SpecialistTrack, lessonId = "") {
  const learned = new Set(profile.completed.words);
  const completed = new Set(profile.completed[track]);
  const candidates = characterIndex.filter((character) => isCoreCharacter(character) && learned.has(character.id));
  const next = candidates.find((character) => !completed.has(character.id));
  const nextLesson = lessonIndex.find((lesson) => lesson.id === next?.lessonId);
  const lessons = lessonIndex.map((lesson) => {
    const lessonCandidates = candidates.filter((character) => character.lessonId === lesson.id);
    return {
      ...lesson,
      completed: lessonCandidates.filter((character) => completed.has(character.id)).length,
      total: lessonCandidates.length,
    };
  });
  const lesson = lessonIndex.find((item) => item.id === lessonId) ?? lessonIndex[0];
  const eligible = candidates.filter((character) => character.lessonId === lesson.id).map((character, index) => ({
    ...character,
    sequence: String(index + 1).padStart(2, "0"),
    done: completed.has(character.id),
  }));
  return {
    trackInfo: meta[track],
    lessons,
    lesson,
    eligible,
    hasEligible: eligible.length > 0,
    lessonCompleted: eligible.filter((character) => character.done).length,
    lessonTotal: eligible.length,
    next,
    nextLesson,
    hasNext: Boolean(next),
    completed: candidates.filter((character) => completed.has(character.id)).length,
    total: candidates.length,
  };
}

Page({
  data: {
    track: "structure" as SpecialistTrack,
    lessonId: "",
    mode: "map" as "map" | "lesson",
    theme: loadProfile().theme,
    ...buildTrackView(loadProfile(), "structure"),
    navTop: 0,
    navHeight: 52,
    capsuleInset: 0,
  },
  onLoad(options: Record<string, string | undefined>) {
    const track = options.track === "split" || options.track === "honglan" || options.track === "structure"
      ? options.track
      : "structure";
    const lessonId = lessonIndex.some((lesson) => lesson.id === options.lessonId) ? options.lessonId ?? "" : "";
    this.setData({
      track,
      lessonId,
      mode: lessonId ? "lesson" : "map",
      ...buildTrackView(loadProfile(), track, lessonId),
      ...navigationLayout(),
    });
  },
  onShow() {
    const profile = loadProfile();
    this.setData({ ...buildTrackView(profile, this.data.track, this.data.lessonId), theme: profile.theme });
  },
  goBack() {
    wx.navigateBack({
      fail: () => this.data.mode === "lesson"
        ? wx.redirectTo({ url: `/pages/track/index?track=${this.data.track}` })
        : wx.switchTab({ url: "/pages/practice-hub/index" }),
    });
  },
  openLesson(event: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/track/index?track=${this.data.track}&lessonId=${event.currentTarget.dataset.id}` });
  },
  openCharacter(event: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/practice/index?track=${this.data.track}&lessonId=${this.data.lesson.id}&characterId=${event.currentTarget.dataset.id}` });
  },
  continueTrack() {
    const next = this.data.next;
    if (!next) {
      wx.switchTab({ url: "/pages/lessons/index" });
      return;
    }
    wx.navigateTo({ url: `/pages/practice/index?track=${this.data.track}&lessonId=${next.lessonId}&characterId=${next.id}` });
  },
  openWordLesson() {
    wx.navigateTo({ url: `/pages/lesson/index?lessonId=${this.data.lesson.id}&view=words` });
  },
});
