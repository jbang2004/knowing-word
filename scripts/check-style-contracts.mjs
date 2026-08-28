import { readFile, readdir } from "node:fs/promises";
import { extname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const tokens = JSON.parse(await readFile(resolve(root, "config/design-tokens.json"), "utf8"));

async function styleFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return styleFiles(path);
    return [".css", ".wxss"].includes(extname(entry.name)) ? [path] : [];
  }))).flat();
}

function luminance(hex) {
  const channels = hex.match(/[a-f0-9]{2}/giu)?.map((value) => Number.parseInt(value, 16) / 255) ?? [];
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(left, right) {
  const [light, dark] = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

for (const theme of ["light", "dark"]) {
  for (const [surface, ink] of [["sky", "ink"], ["paper", "ink"], ["action", "action-ink"], ["radical", "radical-ink"], ["part", "part-ink"], ["wrong", "wrong-ink"]]) {
    if (contrast(tokens[theme][surface], tokens[theme][ink]) < 4.5) {
      throw new Error(`${theme} ${surface}/${ink} does not meet WCAG AA contrast`);
    }
  }
}

const files = [
  ...(await styleFiles(resolve(root, "app"))),
  ...(await styleFiles(resolve(root, "wechat-miniprogram/miniprogram"))),
];
const contents = await Promise.all(files.map((path) => readFile(path, "utf8")));
const importantCount = contents.reduce((sum, value) => sum + (value.match(/!important/gu)?.length ?? 0), 0);
if (importantCount > 19) throw new Error(`Style override budget exceeded: ${importantCount} !important declarations`);

const canonicalNames = Object.keys(tokens.light);
for (const [index, contentsValue] of contents.entries()) {
  if (files[index].includes("design-tokens.generated")) continue;
  for (const name of canonicalNames) {
    if (new RegExp(`--${name}\\s*:`, "u").test(contentsValue)) {
      throw new Error(`Canonical token --${name} is redefined in ${files[index]}`);
    }
  }
}

process.stdout.write(`Style contracts passed across ${files.length} stylesheets.\n`);
