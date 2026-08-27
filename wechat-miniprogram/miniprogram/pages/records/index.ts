import { apiRequest, downloadRecording } from "../../services/api";
import { characterIndex, lessonIndex } from "../../services/catalog";
import { loadProfile, syncProfile } from "../../services/profile";
import { getSessionStatus } from "../../services/session";
import type { StudyProfile, TrackId } from "../../types/models";

let recordingPlayer: WechatMiniprogram.InnerAudioContext | null = null;
const trackLabels: Record<TrackId, string> = { words: "完整识字", split: "拆字复习", honglan: "部首辨认", structure: "结构复习" };

function summary(profile: StudyProfile) {
  const tracks = (Object.keys(trackLabels) as TrackId[]).map((id) => ({ id, label: trackLabels[id], completed: profile.completed[id].length }));
  const attempts = Object.values(profile.daily).reduce((sum, day) => sum + day.attempts, 0);
  const readSessions = Object.values(profile.daily).reduce((sum, day) => sum + day.readSessions, 0);
  const days = Object.keys(profile.daily).length;
  const completedWords = new Set(profile.completed.words);
  const lessons = lessonIndex.map((lesson) => {
    const candidates = characterIndex.filter((character) => character.lessonId === lesson.id && character.ready);
    const completed = candidates.filter((character) => completedWords.has(character.id)).length;
    return { id: lesson.id, title: lesson.title, position: lesson.position, completed, total: candidates.length, percent: candidates.length ? Math.round(completed / candidates.length * 100) : 0 };
  }).filter((lesson) => lesson.completed > 0);
  return { tracks, attempts, readSessions, days, lessons };
}

Page({
  data: {
    ...summary(loadProfile()),
    recordings: [] as Array<{ id: string; lessonId: string; lessonTitle: string; byteSizeText: string; dateText: string }>,
    cloudConnected: getSessionStatus().connected,
    cloudLoading: false,
    playingId: "",
  },
  onShow() {
    this.setData({ ...summary(loadProfile()), cloudConnected: getSessionStatus().connected });
    void this.loadRecordings();
  },
  onUnload() { recordingPlayer?.destroy(); recordingPlayer = null; },
  async onPullDownRefresh() {
    const profile = await syncProfile();
    this.setData(summary(profile));
    await this.loadRecordings();
    wx.stopPullDownRefresh();
  },
  async loadRecordings() {
    if (!getSessionStatus().connected) return;
    this.setData({ cloudLoading: true });
    try {
      const response = await apiRequest<{ recordings: Array<{ id: string; lessonId: string; byteSize: number; createdAt: string }> }>("/api/recordings");
      this.setData({
        recordings: response.recordings.map((recording) => ({
          ...recording,
          lessonTitle: lessonIndex.find((lesson) => lesson.id === recording.lessonId)?.title ?? recording.lessonId,
          byteSizeText: `${Math.max(1, Math.round(recording.byteSize / 1024))} KB`,
          dateText: new Date(recording.createdAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        })),
      });
    } catch (error) {
      console.info("Cloud recordings unavailable", error);
    } finally {
      this.setData({ cloudLoading: false });
    }
  },
  openLesson(event: WechatMiniprogram.BaseEvent) { wx.navigateTo({ url: `/pages/lesson/index?lessonId=${event.currentTarget.dataset.id}` }); },
  async playRecording(event: WechatMiniprogram.BaseEvent) {
    const id = event.currentTarget.dataset.id as string;
    if (recordingPlayer && this.data.playingId === id) {
      recordingPlayer.stop();
      return;
    }
    wx.showLoading({ title: "正在取回录音" });
    try {
      const path = await downloadRecording(id);
      recordingPlayer?.destroy();
      recordingPlayer = wx.createInnerAudioContext();
      recordingPlayer.src = path;
      recordingPlayer.onPlay(() => this.setData({ playingId: id }));
      recordingPlayer.onEnded(() => this.setData({ playingId: "" }));
      recordingPlayer.onStop(() => this.setData({ playingId: "" }));
      recordingPlayer.onError(() => { this.setData({ playingId: "" }); wx.showToast({ title: "录音无法播放", icon: "none" }); });
      recordingPlayer.play();
    } catch (error) {
      wx.showToast({ title: error instanceof Error ? error.message : "录音下载失败", icon: "none" });
    } finally {
      wx.hideLoading();
    }
  },
});
