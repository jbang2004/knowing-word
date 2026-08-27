Component({
  properties: {
    active: { type: String, value: "home" },
    theme: { type: String, value: "light" },
  },
  data: {
    items: [
      { id: "home", pagePath: "/pages/home/index", text: "学习", icon: "home" },
      { id: "course", pagePath: "/pages/lessons/index", text: "课本", icon: "book" },
      { id: "practice", pagePath: "/pages/practice-hub/index", text: "练习", icon: "grid" },
      { id: "profile", pagePath: "/pages/account/index", text: "我的", icon: "person" },
    ],
  },
});
