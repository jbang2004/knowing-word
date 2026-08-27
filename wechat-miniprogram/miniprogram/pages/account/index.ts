import { characterIndex, isCoreCharacter } from "../../services/catalog";
import { navigationLayout } from "../../services/layout";
import { ensureWechatSession, getSessionStatus } from "../../services/session";
import { loadProfile, resetEverywhere, saveProfile, syncProfile } from "../../services/profile";

const gradeOptions = [1, 2, 3, 4, 5, 6].map((value) => ({ value, label: `${value} 年级` }));

function applyThemeChrome(theme: "light" | "night") {
  const backgroundColor = theme === "night" ? "#111b19" : "#fffcf6";
  wx.setBackgroundColor({ backgroundColor, backgroundColorTop: backgroundColor, backgroundColorBottom: backgroundColor });
  wx.setBackgroundTextStyle({ textStyle: theme === "night" ? "light" : "dark" });
}

function accountView() {
  const profile = loadProfile();
  const session = getSessionStatus();
  const completed = (Object.keys(profile.completed) as Array<keyof typeof profile.completed>)
    .reduce((sum, track) => sum + profile.completed[track].length, 0);
  return {
    name: profile.name,
    displayName: profile.name || "小探险家",
    initial: (profile.name || "学").slice(0, 1),
    connected: session.connected,
    completed,
    total: characterIndex.filter(isCoreCharacter).length,
    components: profile.learnedComponents.length,
    favorites: profile.favorites.length,
    grade: profile.grade,
    gradeOptions,
    gradeIndex: Math.max(0, gradeOptions.findIndex((option) => option.value === profile.grade)),
    theme: profile.theme,
    headingCopy: session.connected
      ? "学习进度已经安全同步，换设备后也能从上次的位置继续。"
      : "当前处于离线模式，恢复网络后会自动同步。",
  };
}

Page({
  data: { ...accountView(), contentTop: 70, pageMotion: "page-arrive-a" },
  onLoad() {
    this.setData(navigationLayout());
  },
  onShow() {
    const view = accountView();
    this.getTabBar?.()?.setData({ selected: 3, theme: view.theme });
    this.setData({
      ...view,
      pageMotion: this.data.pageMotion === "page-arrive-a" ? "page-arrive-b" : "page-arrive-a",
    });
    applyThemeChrome(view.theme);
  },
  onNameInput(event: WechatMiniprogram.Input) { this.setData({ name: event.detail.value.slice(0, 18) }); },
  saveName() {
    const profile = loadProfile();
    profile.name = this.data.name.trim();
    profile.preferenceUpdatedAt = { ...profile.preferenceUpdatedAt, name: new Date().toISOString() };
    saveProfile(profile, true);
    this.setData(accountView());
    this.getTabBar?.()?.setData({ theme: profile.theme });
    applyThemeChrome(profile.theme);
    wx.showToast({ title: "昵称已保存", icon: "success" });
  },
  changeGrade(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    const index = Number(event.detail.value);
    const grade = gradeOptions[index]?.value;
    if (!grade) return;
    const profile = loadProfile();
    profile.grade = grade;
    profile.preferenceUpdatedAt = { ...profile.preferenceUpdatedAt, grade: new Date().toISOString() };
    saveProfile(profile, true);
    this.setData(accountView());
    wx.showToast({ title: `已切换到${grade}年级`, icon: "none" });
  },
  toggleTheme() {
    const profile = loadProfile();
    profile.theme = profile.theme === "night" ? "light" : "night";
    profile.preferenceUpdatedAt = { ...profile.preferenceUpdatedAt, theme: new Date().toISOString() };
    saveProfile(profile, true);
    this.setData(accountView());
    this.getTabBar?.()?.setData({ theme: profile.theme });
    applyThemeChrome(profile.theme);
    wx.showToast({ title: profile.theme === "night" ? "已切换夜读模式" : "已切换日间模式", icon: "none" });
  },
  async reconnect() {
    wx.showLoading({ title: "连接微信同步" });
    const session = await ensureWechatSession(true);
    if (session) await syncProfile();
    wx.hideLoading();
    this.setData(accountView());
    wx.showToast({ title: session ? "同步已连接" : "正式配置后即可连接", icon: "none" });
  },
  openComponents() { wx.navigateTo({ url: "/pages/components/index" }); },
  resetProgress() {
    wx.showModal({
      title: "清除全部学习记录？",
      content: this.data.connected ? "本机进度、云端档案和已上传录音都会清除，无法撤销。" : "本机进度会被清除，无法撤销。",
      confirmText: "确认清除",
      confirmColor: "#FF5B34",
      success: async (result) => {
        if (!result.confirm) return;
        wx.showLoading({ title: "正在清除" });
        try {
          await resetEverywhere();
          this.setData(accountView());
          wx.showToast({ title: "学习记录已清除", icon: "success" });
        } catch (error) {
          wx.showToast({ title: error instanceof Error ? error.message : "清除失败", icon: "none" });
        } finally {
          wx.hideLoading();
        }
      },
    });
  },
});
