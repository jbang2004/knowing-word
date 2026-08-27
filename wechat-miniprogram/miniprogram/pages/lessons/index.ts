import { charactersForLesson, lessonCover, lessonIndex } from "../../services/catalog";
import { loadProfile, syncProfile } from "../../services/profile";
import type { StudyProfile } from "../../types/models";

function lessonRows(profile: StudyProfile) {
  const completed = new Set(profile.completed.words);
  return lessonIndex.map((lesson) => {
    const lessonCharacters = charactersForLesson(lesson.id).filter((character) => character.ready);
    const count = lessonCharacters.filter((character) => completed.has(character.id)).length;
    const percent = lessonCharacters.length ? Math.round(count / lessonCharacters.length * 100) : 0;
    return {
      ...lesson,
      cover: lessonCover(lesson),
      count,
      total: lessonCharacters.length,
      percent,
      status: percent === 100 ? "已完成" : percent > 0 ? "继续学习" : "尚未开始",
    };
  });
}

Page({
  data: { lessons: lessonRows(loadProfile()) },
  onShow() {
    this.getTabBar?.()?.setData({ selected: 1 });
    this.setData({ lessons: lessonRows(loadProfile()) });
  },
  async onPullDownRefresh() {
    this.setData({ lessons: lessonRows(await syncProfile()) });
    wx.stopPullDownRefresh();
  },
  openLesson(event: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/lesson/index?lessonId=${event.currentTarget.dataset.id}` });
  },
});
