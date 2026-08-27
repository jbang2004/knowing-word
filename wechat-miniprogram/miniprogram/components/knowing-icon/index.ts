const ICON_GLYPHS: Record<string, string> = {
  home: "\uE470",
  book: "\uE0C8",
  "book-open": "\uE0C8",
  grid: "\uE8FB",
  "view-module": "\uE8FB",
  person: "\uE8C9",
  user: "\uE8C9",
  "check-circle": "\uE1B8",
  check: "\uE1BC",
  lock: "\uE512",
  "chevron-right": "\uE1D8",
  "chevron-down": "\uE1D8",
  "arrow-right": "\uE079",
  "arrow-left": "\uE070",
  refresh: "\uE6D6",
  microphone: "\uE5C7",
  search: "\uE71D",
  star: "\uE783",
  "star-filled": "\uE782",
  replay: "\uE6E0",
  close: "\uE224",
  chart: "\uE190",
  moon: "\uE5F4",
  delete: "\uE2BF",
  sound: "\uE77A",
  "stop-circle": "\uE78B",
  "play-circle": "\uE6A5",
  history: "\uE46E",
  list: "\uE8F9",
  "assignment-check": "\uE08A",
};

Component({
  properties: {
    name: { type: String, value: "" },
    size: { type: Number, value: 16 },
    tone: { type: String, value: "light" },
    label: { type: String, value: "" },
  },
  data: {
    glyph: "",
  },
  observers: {
    name(name: string) {
      this.setData({ glyph: ICON_GLYPHS[name] || "" });
    },
  },
});
