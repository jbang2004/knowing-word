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
    eyebrow: "一次完成这个字的完整过关",
    copy: "从课文词语出发，连续完成字义、字形、结构、部件与对应书写练习。专项入口保留给之后的针对性复习。",
    action: "继续识字",
    origin: "识字小测",
    glyph: "字",
    tone: "action",
  },
  split: {
    id: "split",
    label: "拆字复习",
    menu: "拆字复习",
    eyebrow: "不牢时，拆一拆再写一写",
    copy: "这是选做复习：把汉字拆成部首和部件，自己搭回去，再落笔写完整的字。",
    action: "继续拆字复习",
    origin: "拆一拆",
    glyph: "拆",
    tone: "part",
  },
  honglan: {
    id: "honglan",
    label: "红蓝复习",
    menu: "红蓝复习",
    eyebrow: "不牢时，再分清部首与其他部件",
    copy: "这是选做复习：让表意的部首和其他部件穿上不同颜色，建立字形的颜色记忆。",
    action: "继续红蓝复习",
    origin: "红蓝字",
    glyph: "红蓝",
    tone: "radical",
  },
  structure: {
    id: "structure",
    label: "结构复习",
    menu: "结构复习",
    eyebrow: "不牢时，像搭积木一样再看汉字",
    copy: "这是选做复习：左右、上下、包围……先看部件怎样站位，再选出正确的空间结构。",
    action: "继续结构复习",
    origin: "空间结构",
    glyph: "构",
    tone: "wrong",
  },
};

export const practiceTrackIds: readonly Exclude<TrackId, "words">[] = [
  "structure",
  "split",
  "honglan",
];

export const learningTrackIds: readonly TrackId[] = [
  "words",
  ...practiceTrackIds,
];
