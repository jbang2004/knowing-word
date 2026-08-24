import type { TrackId } from "../lib/profile-model";

export type TrackTone = "action" | "part" | "radical" | "wrong";

export type TrackMeta = {
  id: TrackId;
  label: string;
  menu: string;
  eyebrow: string;
  copy: string;
  action: string;
  origin: string;
  glyph: string;
  tone: TrackTone;
};

export const trackMeta: Record<TrackId, TrackMeta> = {
  words: {
    id: "words",
    label: "词语表与写字表",
    menu: "识字",
    eyebrow: "理解字义，认识字形",
    copy: "从课文词语出发，先听故事、看字形，再完成一套由浅入深的小测。",
    action: "继续识字",
    origin: "识字小测",
    glyph: "字",
    tone: "action",
  },
  split: {
    id: "split",
    label: "课后练习",
    menu: "拆字",
    eyebrow: "拆一拆，再写一写",
    copy: "把汉字拆成部首和部件，自己搭回去，再落笔写完整的字。",
    action: "继续拆字",
    origin: "拆一拆",
    glyph: "拆",
    tone: "part",
  },
  honglan: {
    id: "honglan",
    label: "红蓝练习",
    menu: "红蓝",
    eyebrow: "分清部首与其他部件",
    copy: "让表意的部首和其他部件穿上不同颜色，建立字形的颜色记忆。",
    action: "继续红蓝",
    origin: "红蓝字",
    glyph: "红蓝",
    tone: "radical",
  },
  structure: {
    id: "structure",
    label: "空间结构",
    menu: "结构",
    eyebrow: "像搭积木一样看汉字",
    copy: "左右、上下、包围……先看部件怎样站位，再选出正确的空间结构。",
    action: "继续结构",
    origin: "空间结构",
    glyph: "构",
    tone: "wrong",
  },
};

export const practiceTrackIds: readonly Exclude<TrackId, "words">[] = [
  "split",
  "honglan",
  "structure",
];
