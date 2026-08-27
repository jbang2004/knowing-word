import { characterIndex } from "../../services/catalog";
import { ensureWechatSession, getSessionStatus } from "../../services/session";
import { loadProfile, resetEverywhere, saveProfile, syncProfile } from "../../services/profile";

function accountView() {
  const profile = loadProfile();
  const session = getSessionStatus();
  return {
    name: profile.name,
    displayName: profile.name || "小探险家",
    initial: (profile.name || "学").slice(0, 1),
    connected: session.connected,
    completed: profile.completed.words.length,
    total: characterIndex.filter((character) => character.ready).length,
    components: profile.learnedComponents.length,
    favorites: profile.favorites.length,
  };
}

Page({
  data: accountView(),
  onShow() {
    this.getTabBar?.()?.setData({ selected: 3 });
    this.setData(accountView());
  },
  onNameInput(event: WechatMiniprogram.Input) { this.setData({ name: event.detail.value.slice(0, 18) }); },
  saveName() {
    const profile = loadProfile();
    profile.name = this.data.name.trim();
    profile.preferenceUpdatedAt = { ...profile.preferenceUpdatedAt, name: new Date().toISOString() };
    saveProfile(profile, true);
    this.setData(accountView());
    wx.showToast({ title: "昵称已保存", icon: "success" });
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
