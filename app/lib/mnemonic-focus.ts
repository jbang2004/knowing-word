// Where each component sits inside a character's 物象图.
//
// The illustrations are composed so the drawn objects occupy the positions the
// character's own structure implies — in 鹭 the stone path runs across the top
// and the egret stands below, matching 上下结构 and the document order of
// `parts`. That makes the structure label enough to aim a spotlight, so the
// four-step demo can light up the part it is talking about without anyone
// hand-annotating 359 pictures.
//
// Values are percentages of the artwork box: x/y are the region's centre.

export type FocusRegion = { x: number; y: number; w: number; h: number };

const WHOLE: FocusRegion = { x: 50, y: 50, w: 86, h: 86 };

function stack(count: number): FocusRegion[] {
  const band = 100 / count;
  return Array.from({ length: count }, (_, index) => ({
    x: 50,
    y: band * index + band / 2,
    w: 78,
    h: Math.min(56, band + 14),
  }));
}

function beside(count: number): FocusRegion[] {
  const column = 100 / count;
  return Array.from({ length: count }, (_, index) => ({
    x: column * index + column / 2,
    y: 52,
    w: Math.min(60, column + 10),
    h: 78,
  }));
}

// An enclosing radical wraps the frame; whatever it encloses sits inside it.
function enclosure(outer: FocusRegion): FocusRegion[] {
  return [outer, { x: 56, y: 58, w: 50, h: 50 }];
}

const BY_STRUCTURE: Record<string, (count: number) => FocusRegion[]> = {
  上下结构: () => stack(2),
  上中下结构: () => stack(3),
  左右结构: () => beside(2),
  穿插结构: () => [WHOLE, WHOLE],
  独体结构: () => [WHOLE],
  独体字: () => [WHOLE],
  左上包围结构: () => enclosure({ x: 38, y: 40, w: 68, h: 68 }),
  左下包围结构: () => enclosure({ x: 38, y: 62, w: 68, h: 68 }),
  右上包围结构: () => enclosure({ x: 62, y: 40, w: 68, h: 68 }),
  半包围结构: () => enclosure({ x: 42, y: 50, w: 70, h: 74 }),
  左三包围结构: () => enclosure({ x: 40, y: 50, w: 72, h: 78 }),
  上三包围结构: () => enclosure({ x: 50, y: 42, w: 78, h: 70 }),
  全包围结构: () => enclosure({ x: 50, y: 50, w: 84, h: 84 }),
};

export function getPartFocusRegions(
  decomposition: string | undefined,
  partCount: number,
): FocusRegion[] {
  const count = Math.max(1, partCount);
  const build = decomposition ? BY_STRUCTURE[decomposition] : undefined;
  const regions = build ? build(count) : count > 1 ? beside(count) : [WHOLE];
  // Structures describe a fixed number of slots; a character with more parts
  // than slots falls back to the whole scene rather than pointing somewhere
  // wrong.
  return Array.from({ length: count }, (_, index) => regions[index] ?? WHOLE);
}

// The spotlight lights one or more parts at once, so merge the active regions
// into the box that covers them.
export function mergeFocusRegions(regions: FocusRegion[]): FocusRegion | null {
  if (!regions.length) return null;
  const left = Math.min(...regions.map((region) => region.x - region.w / 2));
  const right = Math.max(...regions.map((region) => region.x + region.w / 2));
  const top = Math.min(...regions.map((region) => region.y - region.h / 2));
  const bottom = Math.max(...regions.map((region) => region.y + region.h / 2));
  return {
    x: (left + right) / 2,
    y: (top + bottom) / 2,
    w: right - left,
    h: bottom - top,
  };
}
