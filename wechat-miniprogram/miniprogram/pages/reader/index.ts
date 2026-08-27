import { API_BASE_URL } from "../../config";
import { characterIndex, getLessonContent, isCoreCharacter, lessonIndex } from "../../services/catalog";
import { sendReadingEvent } from "../../services/events";
import { navigationLayout } from "../../services/layout";
import { playLearningSound } from "../../services/learning-sounds";
import { loadProfile, recordReading } from "../../services/profile";
import { uploadRecording } from "../../services/api";
import { getSessionStatus } from "../../services/session";

let recorder: WechatMiniprogram.RecorderManager | null = null;
let player: WechatMiniprogram.InnerAudioContext | null = null;
let sentencePlayer: WechatMiniprogram.InnerAudioContext | null = null;

function minimumReadingDurationMs(text = "") {
  const readableCharacters = Array.from(text).filter((character) => /[\p{L}\p{N}]/u.test(character)).length;
  return Math.max(3_000, readableCharacters * 150);
}

function lessonLearningComplete(lessonId: string) {
  const profile = loadProfile();
  const wordIds = characterIndex
    .filter((character) => character.lessonId === lessonId && isCoreCharacter(character))
    .map((character) => character.id);
  return wordIds.length > 0 && wordIds.every((id) => profile.completed.words.includes(id));
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
    recordingDurationMs: 0,
    recordingListenedToEnd: false,
    canAssess: false,
    showRecordingGate: false,
    showRecordingAssessment: false,
    recordingGateMessage: "请先完整回听录音，再判断每个字是否读准。",
    readingAssessment: "",
    playing: false,
    speaking: false,
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
      this.setData({ recording: true, tempFilePath: "", durationText: "", recordingDurationMs: 0, recordingListenedToEnd: false, canAssess: false, showRecordingGate: false, showRecordingAssessment: false, readingAssessment: "", cloudStatus: "", cloudSaving: false });
    });
    recorder.onStop((result) => {
      const durationMs = Math.max(0, result.duration ?? 0);
      this.setData({
        recording: false,
        tempFilePath: result.tempFilePath,
        durationText: `${Math.max(1, Math.round(durationMs / 1000))} 秒`,
        recordingDurationMs: durationMs,
        recordingListenedToEnd: false,
        canAssess: false,
        showRecordingGate: !getSessionStatus().connected,
        showRecordingAssessment: false,
        recordingGateMessage: durationMs < minimumReadingDurationMs(this.data.lesson.context)
          ? "这段录音太短，可能没有读完整；请重新录完全文。"
          : "请先完整回听录音，再判断每个字是否读准。",
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
    if (this.data.recording) recorder?.stop();
    player?.destroy();
    player = null;
    sentencePlayer?.destroy();
    sentencePlayer = null;
  },
  async loadDocument() {
    try {
      const content = await getLessonContent(this.data.lessonId);
      this.setData({
        lesson: content.lesson,
        document: content.document,
        lessonIndexValue: Math.max(0, lessonIndex.findIndex((lesson) => lesson.id === content.lesson.id)),
        loading: false,
      });
    } catch (error) {
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
    this.setData({ lessonId, loading: true, error: "", tempFilePath: "", durationText: "", recordingDurationMs: 0, recordingListenedToEnd: false, canAssess: false, showRecordingGate: false, showRecordingAssessment: false, readingAssessment: "", playing: false, speaking: false, cloudStatus: "", cloudSaving: false });
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
    preview.onPlay(() => this.setData({ speaking: true }));
    preview.onEnded(() => this.setData({ speaking: false }));
    preview.onStop(() => this.setData({ speaking: false }));
    preview.onError(() => {
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
    player.onPlay(() => this.setData({ playing: true, recordingListenedToEnd: false, canAssess: false, showRecordingGate: !this.data.cloudSaving, showRecordingAssessment: false, recordingGateMessage: this.data.recordingDurationMs < minimumReadingDurationMs(this.data.lesson.context) ? "这段录音太短，可能没有读完整；请重新录完全文。" : "请先完整回听录音，再判断每个字是否读准。" }));
    player.onEnded(() => {
      const canAssess = this.data.recordingDurationMs >= minimumReadingDurationMs(this.data.lesson.context);
      this.setData({ playing: false, recordingListenedToEnd: true, canAssess, showRecordingGate: !canAssess && !this.data.cloudSaving, showRecordingAssessment: canAssess && !this.data.cloudSaving, recordingGateMessage: canAssess ? "" : "这段录音太短，可能没有读完整；请重新录完全文。" });
    });
    player.onStop(() => this.setData({ playing: false, recordingListenedToEnd: false, canAssess: false, showRecordingGate: !this.data.cloudSaving, showRecordingAssessment: false }));
    player.onError(() => { this.setData({ playing: false }); wx.showToast({ title: "录音无法播放", icon: "none" }); });
    player.play();
  },
  async saveCloud(path: string) {
    this.setData({ cloudStatus: "正在保存到云端…", cloudSaving: true, showRecordingGate: false, showRecordingAssessment: false });
    try {
      await uploadRecording(this.data.lessonId, path, "audio/mpeg");
      this.setData({ cloudStatus: "已保存，可在记录页跨设备回听", cloudSaving: false, showRecordingGate: !this.data.canAssess, showRecordingAssessment: this.data.canAssess });
    } catch (error) {
      this.setData({ cloudStatus: error instanceof Error ? error.message : "云端保存失败，本机录音仍可回听", cloudSaving: false, showRecordingGate: !this.data.canAssess, showRecordingAssessment: this.data.canAssess });
    }
  },
  assess(event: WechatMiniprogram.BaseEvent) {
    if (!this.data.canAssess) {
      wx.showToast({ title: this.data.recordingGateMessage || "请先完整回听录音", icon: "none" });
      return;
    }
    const accurate = event.currentTarget.dataset.accurate === true || event.currentTarget.dataset.accurate === "true";
    const profile = loadProfile();
    const firstAccurateCompletion = accurate && !profile.readLessons.includes(this.data.lessonId) && lessonLearningComplete(this.data.lessonId);
    recordReading(this.data.lessonId, accurate);
    sendReadingEvent(this.data.lessonId, accurate);
    if (firstAccurateCompletion) playLearningSound("dailyComplete");
    this.setData({ readingAssessment: accurate ? "accurate" : "needs-practice", canAssess: false, showRecordingGate: false, showRecordingAssessment: false });
    wx.showToast({ title: accurate ? "已完成本课朗读" : "已加入复习计划", icon: accurate ? "success" : "none" });
  },
  goBack() { wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/practice-hub/index" }) }); },
});
