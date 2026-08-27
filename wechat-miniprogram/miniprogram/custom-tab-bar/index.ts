import { loadProfile } from "../services/profile";

Component({
  data: {
    selected: 0,
    theme: loadProfile().theme,
    list: [
      { pagePath: "/pages/home/index", text: "学习", icon: "home" },
      { pagePath: "/pages/lessons/index", text: "课本", icon: "book" },
      { pagePath: "/pages/practice-hub/index", text: "练习", icon: "grid" },
      { pagePath: "/pages/account/index", text: "我的", icon: "person" }
    ]
  },
  pageLifetimes: {
    show() { this.setData({ theme: loadProfile().theme }); },
  },
  methods: {
    switchTab(event: WechatMiniprogram.BaseEvent) {
      const index = Number(event.currentTarget.dataset.index);
      const item = this.data.list[index];
      if (!item) return;
      wx.switchTab({ url: item.pagePath });
    }
  }
});
