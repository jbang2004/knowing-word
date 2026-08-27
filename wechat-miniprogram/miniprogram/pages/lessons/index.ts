import { charactersForLesson, isCoreCharacter, lessonCover, lessonIndex } from "../../services/catalog";
import { navigationLayout } from "../../services/layout";
import { loadProfile, syncProfile } from "../../services/profile";
import type { StudyProfile } from "../../types/models";

const unitMeta = [
  { label: "第一单元", start: 1, end: 4 },
  { label: "第二单元", start: 5, end: 8 },
  { label: "第三单元", start: 9, end: 11 },
  { label: "第四单元", start: 12, end: 14 },
  { label: "第五单元", start: 15, end: 17 },
  { label: "第六单元", start: 18, end: 20 },
  { label: "第七单元", start: 21, end: 24 },
  { label: "第八单元", start: 25, end: 26 },
];

function lessonRows(profile: StudyProfile) {
  const completed = new Set(profile.completed.words);
  return lessonIndex.map((lesson) => {
    const lessonCharacters = charactersForLesson(lesson.id).filter(isCoreCharacter);
    const count = lessonCharacters.filter((character) => completed.has(character.id)).length;
    const percent = lessonCharacters.length ? Math.round(count / lessonCharacters.length * 100) : 0;
    return {
      ...lesson,
      cover: lessonCover(lesson),
      count,
      total: lessonCharacters.length,
      percent,
      status: percent === 100 ? "已完成" : percent > 0 ? "继续学习" : "尚未开始",
      glyphs: lessonCharacters.slice(0, 4).map((character) => character.hanzi),
    };
  });
}

function courseView(profile: StudyProfile) {
  const lessons = lessonRows(profile);
  return {
    lessons,
    units: unitMeta.map((unit, index) => {
      const items = lessons.filter((lesson) => lesson.position >= unit.start && lesson.position <= unit.end);
      return {
        ...unit,
        id: `unit-${index + 1}`,
        lessons: items,
        completed: items.reduce((sum, lesson) => sum + lesson.count, 0),
        total: items.reduce((sum, lesson) => sum + lesson.total, 0),
      };
    }),
  };
}

Page({
  data: { ...courseView(loadProfile()), contentTop: 70 },
  onLoad() {
    this.setData(navigationLayout());
  },
  onShow() {
    this.getTabBar?.()?.setData({ selected: 1 });
    this.setData(courseView(loadProfile()));
  },
  async onPullDownRefresh() {
    this.setData(courseView(await syncProfile()));
    wx.stopPullDownRefresh();
  },
  openLesson(event: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({ url: `/pages/lesson/index?lessonId=${event.currentTarget.dataset.id}` });
  },
  jumpUnit(event: WechatMiniprogram.BaseEvent) {
    wx.pageScrollTo({ selector: `#${event.currentTarget.dataset.id}`, offsetTop: -8, duration: 260 });
  },
});
