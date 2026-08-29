import { API_BASE_URL } from "../../config";
import { getLessonContent, lessonIndex } from "../../services/catalog";
import { sendReadingEvent } from "../../services/events";
import { navigationLayout } from "../../services/layout";
import { playLearningSound } from "../../services/learning-sounds";
import { loadProfile, recordReadingPractice } from "../../services/profile";
import { uploadRecording } from "../../services/api";
import { getSessionStatus } from "../../services/session";
import type { ReadingReflection } from "../../types/models";

let recorder: WechatMiniprogram.RecorderManager | null = null;
let player: WechatMiniprogram.InnerAudioContext | null = null;
let sentencePlayer: WechatMiniprogram.InnerAudioContext | null = null;
let documentRequestVersion = 0;

function totalReadingSessions() {
  return Object.values(loadProfile().daily).reduce((total, day) => total + day.readSessions, 0);
}

Page({
  data: {
    theme: loadProfile().theme,
    lessonId: lessonIndex[0].id,
    lesson: lessonIndex[0],
    document: null as Awaited<ReturnType<typeof getLessonContent>>["document"],
    loading: true,
    error: "",
    recording: false,
    tempFilePath: "",
    durationText: "",
    readyToReflect: false,
    readingReflection: "",
    playing: false,
    speaking: false,
    readingSessions: totalReadingSessions(),
    cloudStatus: "",
    cloudSaving: false,
    navHeight: 52,
    lessonIndexValue: 0,
    lessonOptions: lessonIndex.map((lesson) => ({ id: lesson.id, label: `第 ${lesson.position} 课 · ${lesson.title}` })),
  },
  onLoad(options: Record<string, string | undefined>) {
    const lessonId = options.lessonId || lessonIndex[0].id;
    this.setData({ lessonId, lessonIndexValue: Math.max(0, lessonIndex.findIndex((lesson) => lesson.id === lessonId)), ...navigationLayout(0) });
    recorder = wx.getRecorderManager();
    recorder.onStart(() => {
      player?.stop();
      sentencePlayer?.stop();
      this.setData({ recording: true, tempFilePath: "", durationText: "", cloudStatus: "", cloudSaving: false });
    });
    recorder.onStop((result) => {
      const durationMs = Math.max(0, result.duration ?? 0);
      this.setData({
        recording: false,
        tempFilePath: result.tempFilePath,
        durationText: `${Math.max(1, Math.round(durationMs / 1000))} 秒`,
      });
      if (getSessionStatus().connected) void this.saveCloud(result.tempFilePath);
    });
    recorder.onError((error) => {
      this.setData({ recording: false });
      wx.showToast({ title: error.errMsg || "录音没有完成", icon: "none" });
    });
    void this.loadDocument();
  },
  onUnload() {
    documentRequestVersion += 1;
    if (this.data.recording) recorder?.stop();
    player?.destroy();
    player = null;
    sentencePlayer?.destroy();
    sentencePlayer = null;
  },
  async loadDocument() {
    const requestVersion = ++documentRequestVersion;
    const lessonId = this.data.lessonId;
    try {
      const content = await getLessonContent(lessonId);
      if (requestVersion !== documentRequestVersion || this.data.lessonId !== lessonId) return;
      this.setData({
        lesson: content.lesson,
        document: content.document,
        lessonIndexValue: Math.max(0, lessonIndex.findIndex((lesson) => lesson.id === content.lesson.id)),
        loading: false,
      });
    } catch (error) {
      if (requestVersion !== documentRequestVersion || this.data.lessonId !== lessonId) return;
      this.setData({ loading: false, error: error instanceof Error ? error.message : "朗读内容加载失败" });
    }
  },
  chooseLesson(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
    const index = Number(event.detail.value);
    const lesson = lessonIndex[index];
    if (lesson) this.selectLesson(lesson.id);
  },
  stepLesson(event: WechatMiniprogram.BaseEvent) {
    const offset = Number(event.currentTarget.dataset.offset);
    const index = this.data.lessonIndexValue + offset;
    const lesson = lessonIndex[index];
    if (lesson) this.selectLesson(lesson.id);
  },
  selectLesson(lessonId: string) {
    if (lessonId === this.data.lessonId) return;
    if (this.data.recording) recorder?.stop();
    player?.stop();
    sentencePlayer?.destroy();
    sentencePlayer = null;
    this.setData({ lessonId, loading: true, error: "", tempFilePath: "", durationText: "", readyToReflect: false, readingReflection: "", playing: false, speaking: false, cloudStatus: "", cloudSaving: false });
    void this.loadDocument();
  },
  previewSentence() {
    if (sentencePlayer && this.data.speaking) {
      sentencePlayer.stop();
      return;
    }
    sentencePlayer?.destroy();
    const preview = wx.createInnerAudioContext({ useWebAudioImplement: false });
    sentencePlayer = preview;
    preview.src = `${API_BASE_URL}/audio/reading/${this.data.lessonId}.m4a`;
    preview.onPlay(() => {
      if (sentencePlayer === preview) this.setData({ speaking: true });
    });
    preview.onEnded(() => {
      if (sentencePlayer === preview) this.setData({ speaking: false });
    });
    preview.onStop(() => {
      if (sentencePlayer === preview) this.setData({ speaking: false });
    });
    preview.onError(() => {
      if (sentencePlayer !== preview) return;
      this.setData({ speaking: false });
      wx.showToast({ title: "范读暂时无法播放", icon: "none" });
    });
    preview.play();
  },
  toggleRecording() {
    if (this.data.recording) {
      recorder?.stop();
      return;
    }
    recorder?.start({
      duration: 120_000,
      sampleRate: 16_000,
      numberOfChannels: 1,
      encodeBitRate: 48_000,
      format: "mp3",
      frameSize: 50,
    });
  },
  playRecording() {
    if (!this.data.tempFilePath) return;
    if (player && this.data.playing) {
      player.stop();
      return;
    }
    player?.destroy();
    player = wx.createInnerAudioContext();
    player.src = this.data.tempFilePath;
    player.onPlay(() => this.setData({ playing: true }));
    player.onEnded(() => this.setData({ playing: false }));
    player.onStop(() => this.setData({ playing: false }));
    player.onError(() => { this.setData({ playing: false }); wx.showToast({ title: "录音无法播放", icon: "none" }); });
    player.play();
  },
  async saveCloud(path: string) {
    this.setData({ cloudStatus: "正在保存到云端…", cloudSaving: true });
    try {
      await uploadRecording(this.data.lessonId, path, "audio/mpeg");
      this.setData({ cloudStatus: "已保存，可在记录页跨设备回听", cloudSaving: false });
    } catch (error) {
      this.setData({ cloudStatus: error instanceof Error ? error.message : "云端保存失败，本机录音仍可回听", cloudSaving: false });
    }
  },
  markRead() {
    this.setData({ readyToReflect: true, readingReflection: "" });
  },
  reflect(event: WechatMiniprogram.BaseEvent) {
    const reflection = event.currentTarget.dataset.reflection;
    if (reflection !== "comfortable" && reflection !== "needs-practice") return;
    recordReadingPractice(this.data.lessonId, reflection as ReadingReflection);
    sendReadingEvent(this.data.lessonId, reflection as ReadingReflection);
    playLearningSound("encourage");
    this.setData({
      readingReflection: reflection,
      readyToReflect: false,
      readingSessions: totalReadingSessions(),
    });
    wx.showToast({
      title: reflection === "comfortable" ? "已记录这次朗读" : "下次再听再读",
      icon: reflection === "comfortable" ? "success" : "none",
    });
  },
  goBack() { wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/practice-hub/index" }) }); },
});
