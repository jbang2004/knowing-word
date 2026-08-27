import { componentIndex, getLessonContent } from "../../services/catalog";
import { navigationLayout } from "../../services/layout";
import { loadProfile, saveProfile } from "../../services/profile";
import { masteryQuestionsFor } from "../../services/practice";
import type { CatalogCharacter, LessonContent } from "../../types/models";

let audio: WechatMiniprogram.InnerAudioContext | null = null;

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function mnemonicCopy(character: CatalogCharacter, stage: number) {
  const parts = character.parts?.length ? character.parts : [{ char: character.hanzi, radical: true }];
  const scene = character.media?.scene;
  const active = stage === 1 ? parts.filter((part) => part.radical) : stage === 2 ? parts.filter((part) => !part.radical) : parts;
  const activeParts = active.length ? active : parts;
  const activeCues = activeParts.map((part) => {
    const index = parts.findIndex((item) => item.char === part.char && item.radical === part.radical);
    return scene?.cues[index] ?? "";
  }).filter(Boolean).join(" ");
  if (stage === 0) return { eyebrow: "第一眼 · 只看物象", title: "先找出画面里不寻常的轮廓", body: scene?.scene || character.description || "先看完整画面。" };
  if (stage === 1) return { eyebrow: "暖红聚焦 · 表意部首", title: `看见“${activeParts.map((part) => part.char).join("、")}”怎样长进图里`, body: activeCues || scene?.scene || character.description || "找出提示意思的部件。" };
  if (stage === 2) return { eyebrow: "靛蓝聚焦 · 补全字形", title: parts.some((part) => !part.radical) ? `再找“${activeParts.map((part) => part.char).join("、")}”的形与音` : `顺着物体轮廓描一遍“${character.hanzi}”`, body: activeCues || scene?.scene || character.description || "再找补全字形的线索。" };
  return { eyebrow: "最后 · 物象合字", title: `${parts.map((part) => part.char).join(" + ")} = ${character.hanzi}`, body: `现在不要再把它看成几件分散的物体：${scene?.scene || character.description || character.decomposition}` };
}

Page({
  data: {
    theme: loadProfile().theme,
    lessonId: "",
    characterId: "",
    character: null as CatalogCharacter | null,
    characters: [] as LessonContent["characters"],
    loading: true,
    error: "",
    favorite: false,
    playing: false,
    narrationOpen: false,
    narrationFinished: false,
    narrationElapsed: "0:00",
    narrationDuration: "0:00",
    narrationProgress: 0,
    narrationLaunchLabel: "听字义讲解",
    transcriptOpen: false,
    siblingIndex: 0,
    hasPrevious: false,
    hasNext: false,
    navTop: 0,
    navHeight: 52,
    capsuleInset: 0,
    drawerOpen: false,
    masteryCount: 0,
    masteryCompleted: 0,
    masteryActionLabel: "单字过关",
    sceneSize: 225,
    memorySceneSize: 390,
    memoryOpen: false,
    memoryStage: 0,
    memoryMotion: "memory-motion-a",
    memoryEyebrow: "",
    memoryTitle: "",
    memoryBody: "",
    memoryLayout: "layout-single",
    memoryFocusOrder: "focus-start",
    memoryPartsBeside: false,
    memoryLabels: ["看意象", "找部首", "找部件", "合成字"],
    memoryParts: [] as Array<{ char: string; radical: boolean; activeClass: string; status: string }>,
  },
  onLoad(options: Record<string, string | undefined>) {
    const info = wx.getWindowInfo();
    const nav = navigationLayout();
    this.setData({
      lessonId: options.lessonId ?? "",
      characterId: options.characterId ?? "",
      ...nav,
      sceneSize: Math.min(info.windowWidth, 520, Math.max(128, info.windowHeight - nav.navHeight - 591)),
      memorySceneSize: Math.min(info.windowWidth, 520),
    });
    void this.loadCharacter();
  },
  onUnload() {
    audio?.destroy();
    audio = null;
  },
  async loadCharacter() {
    this.setData({ loading: true, error: "" });
    try {
      const content = await getLessonContent(this.data.lessonId);
      const character = content.characters.find((item) => item.id === this.data.characterId);
      if (!character) throw new Error("这张识字卡不存在");
      const siblingIndex = content.characters.findIndex((item) => item.id === character.id);
      const profile = loadProfile();
      const masteryQuestions = masteryQuestionsFor(character);
      wx.setNavigationBarTitle({ title: `${character.hanzi} · ${character.word}` });
      this.setData({
        character,
        characters: content.characters,
        siblingIndex,
        hasPrevious: siblingIndex > 0,
        hasNext: siblingIndex < content.characters.length - 1,
        favorite: profile.favorites.includes(character.id),
        masteryCount: masteryQuestions.length,
        masteryCompleted: masteryQuestions.filter((question) => profile.answers[question.id]?.lastCorrect).length,
        masteryActionLabel: profile.completed.words.includes(character.id) ? "再练一轮" : "单字过关",
        loading: false,
      });
    } catch (error) {
      this.setData({ loading: false, error: error instanceof Error ? error.message : "识字卡加载失败" });
    }
  },
  retry() { void this.loadCharacter(); },
  toggleFavorite() {
    const character = this.data.character;
    if (!character) return;
    const profile = loadProfile();
    const favorite = !profile.favorites.includes(character.id);
    profile.favorites = favorite
      ? [...profile.favorites, character.id]
      : profile.favorites.filter((id) => id !== character.id);
    profile.preferenceUpdatedAt = { ...profile.preferenceUpdatedAt, favorites: new Date().toISOString() };
    saveProfile(profile);
    this.setData({ favorite });
  },
  playNarration() {
    const source = this.data.character?.media?.narration.audio;
    if (!source) {
      wx.showToast({ title: "这张卡暂无范读", icon: "none" });
      return;
    }
    this.setData({ narrationOpen: true, transcriptOpen: false });
    if (audio) {
      if (this.data.playing) audio.pause();
      else {
        if (this.data.narrationFinished) audio.seek(0);
        audio.play();
      }
      return;
    }
    audio = wx.createInnerAudioContext({ useWebAudioImplement: false });
    audio.src = source;
    audio.onCanplay(() => {
      const duration = audio?.duration ?? 0;
      this.setData({ narrationDuration: formatClock(duration) });
    });
    audio.onTimeUpdate(() => {
      const elapsed = audio?.currentTime ?? 0;
      const duration = audio?.duration ?? 0;
      this.setData({
        narrationElapsed: formatClock(elapsed),
        narrationDuration: formatClock(duration),
        narrationProgress: duration > 0 ? Math.min(100, elapsed / duration * 100) : 0,
        narrationLaunchLabel: elapsed > 0 ? "继续字义讲解" : "听字义讲解",
      });
    });
    audio.onPlay(() => this.setData({ playing: true, narrationFinished: false }));
    audio.onPause(() => this.setData({ playing: false }));
    audio.onEnded(() => this.setData({ playing: false, narrationFinished: true, narrationProgress: 100 }));
    audio.onStop(() => this.setData({ playing: false }));
    audio.onError(() => {
      this.setData({ playing: false });
      wx.showToast({ title: "范读暂时无法播放", icon: "none" });
    });
    audio.play();
  },
  collapseNarration() {
    audio?.pause();
    this.setData({ playing: false, narrationOpen: false, transcriptOpen: false });
  },
  previousNarrationPhrase() {
    if (!audio) return;
    audio.seek(Math.max(0, audio.currentTime - 10));
  },
  openTranscript() { this.setData({ transcriptOpen: true }); },
  closeTranscript() { this.setData({ transcriptOpen: false }); },
  startPractice() {
    wx.navigateTo({ url: `/pages/practice/index?track=words&lessonId=${this.data.lessonId}&characterId=${this.data.characterId}` });
  },
  openReader() {
    wx.navigateTo({ url: `/pages/reader/index?lessonId=${this.data.lessonId}` });
  },
  goBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/lessons/index" }) });
  },
  openMemory() {
    const character = this.data.character;
    if (!character) return;
    audio?.pause();
    const layout = character.decomposition.includes("左右") ? "layout-left-right" : character.decomposition.includes("上下") ? "layout-top-bottom" : character.decomposition.includes("包围") ? "layout-surround" : "layout-single";
    const parts = character.parts ?? [];
    const firstRadicalIndex = parts.findIndex((part) => part.radical);
    const focusOrder = firstRadicalIndex >= Math.ceil(parts.length / 2) ? "focus-end" : "focus-start";
    this.setData({
      memoryOpen: true,
      memoryStage: 0,
      memoryLayout: layout,
      memoryFocusOrder: focusOrder,
      memoryPartsBeside: character.decomposition.includes("左右"),
      playing: false,
    });
    this.updateMemoryStage(0);
  },
  updateMemoryStage(stage: number) {
    const character = this.data.character;
    if (!character) return;
    const nextStage = Math.max(0, Math.min(3, stage));
    const copy = mnemonicCopy(character, nextStage);
    this.setData({
      memoryStage: nextStage,
      memoryEyebrow: copy.eyebrow,
      memoryTitle: copy.title,
      memoryBody: copy.body,
      memoryParts: (character.parts ?? []).map((part) => {
        const active = nextStage > 0 && ((nextStage === 1 && part.radical) || (nextStage === 2 && !part.radical));
        return { ...part, activeClass: active ? "is-active" : "", status: active ? "正在看" : "点开看来历" };
      }),
      memoryMotion: this.data.memoryMotion === "memory-motion-a" ? "memory-motion-b" : "memory-motion-a",
    });
  },
  previousMemoryStage() {
    if (this.data.memoryStage === 0) this.closeMemory();
    else this.updateMemoryStage(this.data.memoryStage - 1);
  },
  nextMemoryStage() { this.updateMemoryStage(this.data.memoryStage + 1); },
  replayMemoryImage() { this.updateMemoryStage(0); },
  closeMemory() { this.setData({ memoryOpen: false }); },
  finishMemory() { this.closeMemory(); this.startPractice(); },
  startMemorySwipe(event: WechatMiniprogram.TouchEvent) {
    const touch = event.touches[0];
    (this as unknown as { memorySwipeX: number; memorySwipeY: number }).memorySwipeX = touch.clientX;
    (this as unknown as { memorySwipeX: number; memorySwipeY: number }).memorySwipeY = touch.clientY;
  },
  endMemorySwipe(event: WechatMiniprogram.TouchEvent) {
    const touch = event.changedTouches[0];
    const state = this as unknown as { memorySwipeX?: number; memorySwipeY?: number };
    if (state.memorySwipeX === undefined || state.memorySwipeY === undefined) return;
    const dx = touch.clientX - state.memorySwipeX;
    const dy = touch.clientY - state.memorySwipeY;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy)) this.updateMemoryStage(this.data.memoryStage + (dx < 0 ? 1 : -1));
    state.memorySwipeX = undefined;
    state.memorySwipeY = undefined;
  },
  openDrawer() { this.setData({ drawerOpen: true }); },
  closeDrawer() { this.setData({ drawerOpen: false }); },
  openComponent(event: WechatMiniprogram.BaseEvent) {
    const glyph = event.currentTarget.dataset.glyph as string;
    const component = componentIndex.find((item) => item.glyph === glyph || item.title === glyph);
    wx.navigateTo({ url: `/pages/components/index${component ? `?componentId=${component.id}` : `?query=${encodeURIComponent(glyph)}`}` });
  },
  goSibling(event: WechatMiniprogram.BaseEvent) {
    const offset = Number(event.currentTarget.dataset.offset);
    const character = this.data.characters[this.data.siblingIndex + offset];
    if (!character) return;
    audio?.destroy();
    audio = null;
    this.setData({
      characterId: character.id,
      playing: false,
      narrationOpen: false,
      narrationFinished: false,
      narrationElapsed: "0:00",
      narrationDuration: "0:00",
      narrationProgress: 0,
      narrationLaunchLabel: "听字义讲解",
      transcriptOpen: false,
      memoryOpen: false,
    });
    void this.loadCharacter();
  },
});
