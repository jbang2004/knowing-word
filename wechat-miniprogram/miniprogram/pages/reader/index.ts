import { getLessonContent, lessonIndex } from "../../services/catalog";
import { sendReadingEvent } from "../../services/events";
import { recordReading } from "../../services/profile";
import { uploadRecording } from "../../services/api";
import { getSessionStatus } from "../../services/session";

let recorder: WechatMiniprogram.RecorderManager | null = null;
let player: WechatMiniprogram.InnerAudioContext | null = null;

Page({
  data: {
    lessonId: lessonIndex[0].id,
    lesson: lessonIndex[0],
    document: null as Awaited<ReturnType<typeof getLessonContent>>["document"],
    loading: true,
    error: "",
    recording: false,
    tempFilePath: "",
    durationText: "",
    playing: false,
    cloudStatus: "",
  },
  onLoad(options: Record<string, string | undefined>) {
    this.setData({ lessonId: options.lessonId || lessonIndex[0].id });
    recorder = wx.getRecorderManager();
    recorder.onStart(() => this.setData({ recording: true, tempFilePath: "", durationText: "", cloudStatus: "" }));
    recorder.onStop((result) => {
      this.setData({ recording: false, tempFilePath: result.tempFilePath, durationText: `${Math.max(1, Math.round(result.duration / 1000))} 秒` });
      if (getSessionStatus().connected) void this.saveCloud(result.tempFilePath);
    });
    recorder.onError((error) => {
      this.setData({ recording: false });
      wx.showToast({ title: error.errMsg || "录音没有完成", icon: "none" });
    });
    void this.loadDocument();
  },
  onUnload() {
    if (this.data.recording) recorder?.stop();
    player?.destroy();
    player = null;
  },
  async loadDocument() {
    try {
      const content = await getLessonContent(this.data.lessonId);
      wx.setNavigationBarTitle({ title: `${content.lesson.title} · 朗读` });
      this.setData({ lesson: content.lesson, document: content.document, loading: false });
    } catch (error) {
      this.setData({ loading: false, error: error instanceof Error ? error.message : "朗读内容加载失败" });
    }
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
    this.setData({ cloudStatus: "正在保存到云端…" });
    try {
      await uploadRecording(this.data.lessonId, path, "audio/mpeg");
      this.setData({ cloudStatus: "已保存，可在记录页跨设备回听" });
    } catch (error) {
      this.setData({ cloudStatus: error instanceof Error ? error.message : "云端保存失败，本机录音仍可回听" });
    }
  },
  assess(event: WechatMiniprogram.BaseEvent) {
    const accurate = event.currentTarget.dataset.accurate === true || event.currentTarget.dataset.accurate === "true";
    recordReading(this.data.lessonId, accurate);
    sendReadingEvent(this.data.lessonId, accurate);
    wx.showToast({ title: accurate ? "已完成本课朗读" : "已加入复习计划", icon: accurate ? "success" : "none" });
  },
});
