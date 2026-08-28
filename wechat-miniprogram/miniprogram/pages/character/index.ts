import { componentIndex, getLessonContent } from "../../services/catalog";
import { navigationLayout } from "../../services/layout";
import { narrationView, previousPhraseStart, type NarrationMark, type NarrationTokenView } from "../../services/narration";
import { loadProfile, saveProfile } from "../../services/profile";
import { masteryStepsFor } from "../../services/practice";
import type { CatalogCharacter, LessonContent } from "../../types/models";

let audio: WechatMiniprogram.InnerAudioContext | null = null;
let glyphAudio: WechatMiniprogram.InnerAudioContext | null = null;
let glyphStopTimer: number | null = null;
let narrationSamplingTimer: number | null = null;
let narrationRequestVersion = 0;

function clearNarrationSampling() {
  if (narrationSamplingTimer !== null) clearInterval(narrationSamplingTimer);
  narrationSamplingTimer = null;
}

function destroyGlyphAudio() {
  if (glyphStopTimer !== null) clearTimeout(glyphStopTimer);
  glyphStopTimer = null;
  glyphAudio?.destroy();
  glyphAudio = null;
}

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
    pronouncing: false,
    narrationOpen: false,
    narrationFinished: false,
    narrationElapsed: "0:00",
    narrationDuration: "0:00",
    narrationProgress: 0,
    narrationLaunchLabel: "听字义讲解",
    narrationStatus: "逐字跟读已就绪",
    narrationPhrase: "",
    narrationTranscript: "",
    narrationMarks: [] as NarrationMark[],
    narrationTokens: [] as NarrationTokenView[],
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
    narrationRequestVersion += 1;
    clearNarrationSampling();
    destroyGlyphAudio();
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
      const masteryQuestions = masteryStepsFor(character).map(({ exercise }) => exercise);
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
      void this.loadNarrationTimeline(character);
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
  loadNarrationTimeline(character: CatalogCharacter) {
    const requestVersion = ++narrationRequestVersion;
    const characterId = character.id;
    const transcript = character.media?.narration.transcript ?? character.description ?? "";
    const source = character.media?.narration.marks;
    this.setData({ narrationTranscript: transcript, narrationPhrase: transcript, narrationMarks: [], narrationTokens: [] });
    if (!source) return Promise.resolve();
    return new Promise<void>((resolve) => {
      wx.request<{ marks?: NarrationMark[]; transcript?: string }>({
        url: source,
        timeout: 15_000,
        success: (response) => {
          if (requestVersion !== narrationRequestVersion || this.data.characterId !== characterId) {
            resolve();
            return;
          }
          const marks = (response.data.marks ?? []).filter((mark) => Number.isFinite(mark.start) && Number.isFinite(mark.end));
          const releasedTranscript = response.data.transcript || transcript;
          const view = narrationView(marks, releasedTranscript, audio?.currentTime ?? 0);
          this.setData({ narrationMarks: marks, narrationTranscript: releasedTranscript, narrationTokens: view.tokens, narrationPhrase: view.phrase });
          resolve();
        },
        fail: () => resolve(),
      });
    });
  },
  syncNarrationPlayback() {
    if (!audio) return;
    const elapsed = audio.currentTime ?? 0;
    const duration = audio.duration ?? 0;
    this.setData({
      narrationElapsed: formatClock(elapsed),
      narrationDuration: formatClock(duration),
      narrationProgress: duration > 0 ? Math.min(100, elapsed / duration * 100) : 0,
      narrationLaunchLabel: elapsed > 0 ? "继续字义讲解" : "听字义讲解",
    });
    this.updateNarrationView(elapsed, duration);
  },
  updateNarrationView(elapsed: number, duration: number) {
    const view = narrationView(this.data.narrationMarks, this.data.narrationTranscript, elapsed);
    const finished = duration > 0 && elapsed >= duration - .08 && !this.data.playing;
    this.setData({
      narrationTokens: view.tokens,
      narrationPhrase: view.phrase,
      narrationStatus: finished
        ? "讲解完成 · 点击可重听"
        : this.data.playing && this.data.narrationMarks.length
          ? `正在跟读 · ${view.completed} / ${this.data.narrationMarks.length} 字`
          : elapsed > 0 && this.data.narrationMarks.length
            ? `已读 ${view.completed} / ${this.data.narrationMarks.length} 字 · 点击继续`
            : this.data.narrationMarks.length ? "逐字跟读已就绪" : "标准普通话讲解",
    });
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
    audio.onTimeUpdate(() => this.syncNarrationPlayback());
    audio.onPlay(() => {
      this.setData({ playing: true, narrationFinished: false });
      this.syncNarrationPlayback();
      clearNarrationSampling();
      narrationSamplingTimer = setInterval(() => this.syncNarrationPlayback(), 40);
    });
    audio.onPause(() => {
      clearNarrationSampling();
      this.setData({ playing: false });
      this.updateNarrationView(audio?.currentTime ?? 0, audio?.duration ?? 0);
    });
    audio.onEnded(() => {
      clearNarrationSampling();
      const duration = audio?.duration ?? 0;
      this.setData({ playing: false, narrationFinished: true, narrationProgress: 100 });
      this.updateNarrationView(duration, duration);
    });
    audio.onStop(() => {
      clearNarrationSampling();
      this.setData({ playing: false });
    });
    audio.onError(() => {
      clearNarrationSampling();
      this.setData({ playing: false });
      wx.showToast({ title: "范读暂时无法播放", icon: "none" });
    });
    audio.play();
  },
  playCharacterPronunciation() {
    if (this.data.pronouncing) {
      destroyGlyphAudio();
      this.setData({ pronouncing: false });
      return;
    }
    const source = this.data.character?.media?.narration.audio;
    if (!source) {
      wx.showToast({ title: "这张卡暂无范读", icon: "none" });
      return;
    }
    audio?.pause();
    destroyGlyphAudio();
    const preview = wx.createInnerAudioContext({ useWebAudioImplement: false });
    glyphAudio = preview;
    const firstMark = this.data.narrationMarks[0];
    const start = Math.max(0, firstMark?.start ?? 0);
    const end = firstMark
      ? Math.max(start + .28, firstMark.end + .04)
      : start + .9;
    const finish = () => {
      if (glyphAudio !== preview) return;
      if (glyphStopTimer !== null) clearTimeout(glyphStopTimer);
      glyphStopTimer = null;
      glyphAudio = null;
      preview.destroy();
      this.setData({ pronouncing: false });
    };
    preview.startTime = start;
    preview.onPlay(() => {
      if (glyphAudio !== preview) return;
      this.setData({ pronouncing: true });
      glyphStopTimer = setTimeout(finish, Math.ceil((end - start) * 1000) + 120);
    });
    preview.onTimeUpdate(() => {
      if (preview.currentTime >= end - .02) finish();
    });
    preview.onEnded(finish);
    preview.onStop(finish);
    preview.onError(() => {
      if (glyphAudio !== preview) return;
      finish();
      wx.showToast({ title: "单字范读暂时无法播放", icon: "none" });
    });
    preview.src = source;
    preview.play();
  },
  collapseNarration() {
    audio?.pause();
    clearNarrationSampling();
    this.setData({ playing: false, narrationOpen: false, transcriptOpen: false });
  },
  previousNarrationPhrase() {
    if (!audio) return;
    audio.seek(previousPhraseStart(this.data.narrationMarks, this.data.narrationTranscript, audio.currentTime));
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
    narrationRequestVersion += 1;
    clearNarrationSampling();
    destroyGlyphAudio();
    audio?.destroy();
    audio = null;
    this.setData({
      characterId: character.id,
      playing: false,
      pronouncing: false,
      narrationOpen: false,
      narrationFinished: false,
      narrationElapsed: "0:00",
      narrationDuration: "0:00",
      narrationProgress: 0,
      narrationLaunchLabel: "听字义讲解",
      narrationStatus: "逐字跟读已就绪",
      narrationPhrase: "",
      narrationTranscript: "",
      narrationMarks: [],
      narrationTokens: [],
      transcriptOpen: false,
      memoryOpen: false,
    });
    void this.loadCharacter();
  },
});
