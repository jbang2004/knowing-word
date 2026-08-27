import { characterIndex, componentIndex } from "../../services/catalog";
import { loadProfile, saveProfile } from "../../services/profile";

type ComponentItem = typeof componentIndex[number];

Page({
  data: {
    query: "",
    filtered: componentIndex.slice(0, 80),
    selected: componentIndex[0] as ComponentItem,
    learned: false,
  },
  onLoad(options: Record<string, string | undefined>) {
    const selected = componentIndex.find((item) => item.id === options.componentId) ?? componentIndex[0];
    const query = options.query ? decodeURIComponent(options.query) : "";
    this.setData({ selected, query });
    this.filter(query);
    this.applyLearned();
  },
  onShow() { this.applyLearned(); },
  onSearch(event: WechatMiniprogram.Input) {
    const query = event.detail.value;
    this.setData({ query });
    this.filter(query);
  },
  filter(query: string) {
    const keyword = query.trim().toLowerCase();
    const filtered = (keyword
      ? componentIndex.filter((item) => [item.glyph, item.title, item.description, ...item.examples].some((value) => value.toLowerCase().includes(keyword)))
      : componentIndex).slice(0, 80);
    this.setData({ filtered });
  },
  selectComponent(event: WechatMiniprogram.BaseEvent) {
    const selected = componentIndex.find((item) => item.id === event.currentTarget.dataset.id);
    if (!selected) return;
    this.setData({ selected });
    const profile = loadProfile();
    profile.recentComponents = [selected.id, ...profile.recentComponents.filter((id) => id !== selected.id)].slice(0, 24);
    saveProfile(profile);
    this.applyLearned();
  },
  applyLearned() { this.setData({ learned: loadProfile().learnedComponents.includes(this.data.selected.id) }); },
  toggleLearned() {
    const profile = loadProfile();
    const learned = !profile.learnedComponents.includes(this.data.selected.id);
    profile.learnedComponents = learned
      ? [...profile.learnedComponents, this.data.selected.id]
      : profile.learnedComponents.filter((id) => id !== this.data.selected.id);
    saveProfile(profile);
    this.setData({ learned });
  },
  openExample(event: WechatMiniprogram.BaseEvent) {
    const glyph = event.currentTarget.dataset.glyph as string;
    const character = characterIndex.find((item) => item.hanzi === glyph);
    if (!character) { wx.showToast({ title: "这个例字暂未收录", icon: "none" }); return; }
    wx.navigateTo({ url: `/pages/character/index?lessonId=${character.lessonId}&characterId=${character.id}` });
  },
});
