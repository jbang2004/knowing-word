import type { ComponentItem } from "./catalog-types.ts";
import { extensionComponents } from "./extension-components.ts";
import { grade5Components } from "./generated/grade5-volume1/components.ts";

const componentsByGlyph = new Map<string, ComponentItem>();
for (const component of grade5Components as unknown as ComponentItem[]) {
  componentsByGlyph.set(component.glyph, component);
}
for (const component of extensionComponents) {
  componentsByGlyph.set(component.glyph, component);
}

export const components = [...componentsByGlyph.values()];

export function getComponentByGlyph(glyph: string) {
  return componentsByGlyph.get(glyph);
}
