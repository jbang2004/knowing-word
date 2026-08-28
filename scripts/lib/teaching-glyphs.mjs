/** Unicode ranges that can appear as a visible teaching glyph in runtime data. */
export function isTeachingGlyph(codePoint) {
  return (
    // CJK radicals, description characters, punctuation and stroke symbols.
    (codePoint >= 0x2e80 && codePoint <= 0x33ff)
    || (codePoint >= 0x3400 && codePoint <= 0x9fff)
    || (codePoint >= 0xf900 && codePoint <= 0xfaff)
    // CJK extensions B-F. Several course components live outside the BMP.
    || (codePoint >= 0x20000 && codePoint <= 0x2ebef)
  );
}

/**
 * Walk a runtime value once, reporting malformed Unicode and the locations of
 * every glyph that the bundled teaching font must draw.
 */
export function inspectDisplayGlyphs(value, rootPath = "runtime") {
  const contexts = new Map();
  const invalid = [];

  const inspectString = (text, path) => {
    if (text.includes("\uFFFD")) invalid.push(`${path} contains U+FFFD`);
    for (let index = 0; index < text.length; index += 1) {
      const unit = text.charCodeAt(index);
      if (unit >= 0xd800 && unit <= 0xdbff) {
        const low = text.charCodeAt(index + 1);
        if (!(low >= 0xdc00 && low <= 0xdfff)) {
          invalid.push(`${path} contains an unpaired high surrogate`);
        } else {
          index += 1;
        }
      } else if (unit >= 0xdc00 && unit <= 0xdfff) {
        invalid.push(`${path} contains an unpaired low surrogate`);
      }
    }

    for (const glyph of text) {
      if (!isTeachingGlyph(glyph.codePointAt(0))) continue;
      const found = contexts.get(glyph) ?? [];
      if (found.length < 4) found.push(path);
      contexts.set(glyph, found);
    }
  };

  const inspect = (item, path) => {
    if (typeof item === "string") {
      inspectString(item, path);
      return;
    }
    if (Array.isArray(item)) {
      item.forEach((child, index) => inspect(child, `${path}[${index}]`));
      return;
    }
    if (!item || typeof item !== "object") return;
    for (const [key, child] of Object.entries(item)) inspect(child, `${path}.${key}`);
  };

  inspect(value, rootPath);
  return { contexts, invalid };
}
