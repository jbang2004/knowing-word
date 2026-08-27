import { characterIndex, componentIndex } from "../../services/catalog";
import { navigationLayout } from "../../services/layout";
import { loadProfile, saveProfile } from "../../services/profile";

type ComponentItem = typeof componentIndex[number];
type ViewComponent = ComponentItem & { count: number; learned: boolean; selected: boolean };

const PAGE_SIZE = 36;

function componentCount(component: ComponentItem) {
  return component.characterSet.length || component.examples.length;
}

Page({
  data: {
    theme: loadProfile().theme,
    query: "",
    sortMode: "frequency" as "frequency" | "recent",
    selected: componentIndex[0] as ComponentItem,
    visiblePage: [] as ViewComponent[],
    visibleLimit: PAGE_SIZE,
    resultCount: componentIndex.length,
    summaryTitle: "按课内出现频率排列",
    summaryCount: `显示 ${PAGE_SIZE} / ${componentIndex.length}`,
    hasMore: true,
    nextCount: PAGE_SIZE,
    detailsOpen: false,
    connected: [] as typeof characterIndex,
    recent: null as ComponentItem | null,
    navHeight: 52,
  },
  onLoad(options: Record<string, string | undefined>) {
    const selected = componentIndex.find((item) => item.id === options.componentId) ?? componentIndex[0];
    const query = options.query ? decodeURIComponent(options.query) : "";
    this.setData({ selected, query, detailsOpen: Boolean(options.componentId), ...navigationLayout(0) });
    this.refresh();
  },
  onShow() { this.setData({ theme: loadProfile().theme }); this.refresh(); },
  onSearch(event: WechatMiniprogram.Input) {
    this.setData({ query: event.detail.value, visibleLimit: PAGE_SIZE });
    this.refresh();
  },
  chooseSortMode(event: WechatMiniprogram.BaseEvent) {
    const sortMode = event.currentTarget.dataset.mode === "recent" ? "recent" : "frequency";
    this.setData({ sortMode, visibleLimit: PAGE_SIZE });
    this.refresh();
  },
  refresh() {
    const profile = loadProfile();
    const keyword = this.data.query.trim().toLowerCase();
    let filtered = componentIndex.filter((item) => !keyword || [item.glyph, item.title, item.description, ...item.examples].some((value) => value.toLowerCase().includes(keyword)));
    if (this.data.sortMode === "recent") {
      filtered = filtered
        .filter((item) => profile.recentComponents.includes(item.id))
        .sort((left, right) => profile.recentComponents.indexOf(left.id) - profile.recentComponents.indexOf(right.id));
    } else {
      filtered = filtered.slice().sort((left, right) => componentCount(right) - componentCount(left) || left.sequence - right.sequence);
    }
    const limit = Math.min(this.data.visibleLimit, filtered.length);
    const learned = new Set(profile.learnedComponents);
    const visiblePage = filtered.slice(0, limit).map((item) => ({
      ...item,
      count: componentCount(item),
      learned: learned.has(item.id),
      selected: item.id === this.data.selected.id,
    }));
    const selectedGlyphs = new Set(this.data.selected.characterSet.length ? this.data.selected.characterSet : this.data.selected.examples);
    const connected = characterIndex.filter((character) => selectedGlyphs.has(character.hanzi));
    const recent = componentIndex.find((item) => item.id === profile.recentComponents[0]) ?? null;
    const hasMore = limit < filtered.length;
    this.setData({
      visiblePage,
      resultCount: filtered.length,
      hasMore,
      nextCount: hasMore ? Math.min(PAGE_SIZE, filtered.length - limit) : 0,
      summaryTitle: this.data.sortMode === "recent" ? "最近打开的部件" : keyword ? `“${this.data.query.trim()}”的结果` : "按课内出现频率排列",
      summaryCount: filtered.length ? `显示 ${limit} / ${filtered.length}` : "暂无结果",
      connected,
      recent,
    });
  },
  loadMore() {
    this.setData({ visibleLimit: this.data.visibleLimit + PAGE_SIZE });
    this.refresh();
  },
  selectComponent(event: WechatMiniprogram.BaseEvent) {
    const selected = componentIndex.find((item) => item.id === event.currentTarget.dataset.id);
    if (!selected) return;
    const profile = loadProfile();
    if (!profile.learnedComponents.includes(selected.id)) profile.learnedComponents.push(selected.id);
    profile.recentComponents = [selected.id, ...profile.recentComponents.filter((id) => id !== selected.id)].slice(0, 24);
    saveProfile(profile);
    this.setData({ selected, detailsOpen: true });
    this.refresh();
  },
  closeDetails() { this.setData({ detailsOpen: false }); },
  openExample(event: WechatMiniprogram.BaseEvent) {
    const glyph = event.currentTarget.dataset.glyph as string;
    const character = characterIndex.find((item) => item.hanzi === glyph);
    if (!character) { wx.showToast({ title: "这个例字暂未收录", icon: "none" }); return; }
    wx.navigateTo({ url: `/pages/character/index?lessonId=${character.lessonId}&characterId=${character.id}` });
  },
  goBack() { wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/practice-hub/index" }) }); },
});
