import { componentIndex, getLessonContent } from "../../services/catalog";
import { loadProfile, saveProfile } from "../../services/profile";
import { masteryQuestionsFor } from "../../services/practice";
import type { CatalogCharacter, LessonContent } from "../../types/models";

let audio: WechatMiniprogram.InnerAudioContext | null = null;

Page({
  data: {
    lessonId: "",
    characterId: "",
    character: null as CatalogCharacter | null,
    characters: [] as LessonContent["characters"],
    loading: true,
    error: "",
    favorite: false,
    playing: false,
    siblingIndex: 0,
    hasPrevious: false,
    hasNext: false,
    navTop: 0,
    navHeight: 52,
    capsuleInset: 0,
    drawerOpen: false,
    masteryCount: 0,
    sceneSize: 225,
  },
  onLoad(options: Record<string, string | undefined>) {
    const menu = wx.getMenuButtonBoundingClientRect();
    const info = wx.getWindowInfo();
    const navTop = Math.max(info.statusBarHeight ?? 0, menu.top || 0);
    this.setData({
      lessonId: options.lessonId ?? "",
      characterId: options.characterId ?? "",
      navTop,
      navHeight: navTop + 52,
      capsuleInset: Math.max(0, info.windowWidth - menu.left + 8),
      sceneSize: Math.max(128, Math.min(info.windowWidth, info.windowHeight - (navTop + 52) - 553)),
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
      wx.setNavigationBarTitle({ title: `${character.hanzi} · ${character.word}` });
      this.setData({
        character,
        characters: content.characters,
        siblingIndex,
        hasPrevious: siblingIndex > 0,
        hasNext: siblingIndex < content.characters.length - 1,
        favorite: loadProfile().favorites.includes(character.id),
        masteryCount: masteryQuestionsFor(character).length,
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
    if (audio && this.data.playing) {
      audio.pause();
      this.setData({ playing: false });
      return;
    }
    audio?.destroy();
    audio = wx.createInnerAudioContext({ useWebAudioImplement: false });
    audio.src = source;
    audio.onPlay(() => this.setData({ playing: true }));
    audio.onEnded(() => this.setData({ playing: false }));
    audio.onStop(() => this.setData({ playing: false }));
    audio.onError(() => {
      this.setData({ playing: false });
      wx.showToast({ title: "范读暂时无法播放", icon: "none" });
    });
    audio.play();
  },
  startPractice() {
    wx.navigateTo({ url: `/pages/practice/index?track=words&lessonId=${this.data.lessonId}&characterId=${this.data.characterId}` });
  },
  openReader() {
    wx.navigateTo({ url: `/pages/reader/index?lessonId=${this.data.lessonId}` });
  },
  goBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/lessons/index" }) });
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
    this.setData({ characterId: character.id, playing: false });
    void this.loadCharacter();
  },
});
