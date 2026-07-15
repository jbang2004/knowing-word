import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const knowledgeRoot = resolve(projectRoot, "..", "knowledge-base");
const rawRoot = join(knowledgeRoot, "raw");
const publicRoot = join(projectRoot, "public", "heritage");
const modulePath = join(projectRoot, "app", "data", "heritage-assets.ts");
const accessToken = process.env.MUMU_ACCESS_TOKEN;
const childId = process.env.MUMU_CHILD_ID;

const stageSources = [
  ["甲骨文", "jiaguwen_image_path"],
  ["金文", "jinwen_image_path"],
  ["楚系简帛", "chuxijianbo_image_path"],
  ["说文小篆", "shuowen_image_path"],
  ["秦系简牍", "qinxijiandu_image_path"],
  ["隶书", "lishu_image_path"],
  ["楷书", "kaishu_image_path"],
];

async function download(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`asset request failed: ${response.status}`);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, new Uint8Array(await response.arrayBuffer()));
}

const files = (await readdir(rawRoot)).filter((name) => name.startsWith("wordchar-") && name.endsWith(".json"));
const records = {};

for (const file of files) {
  const characterId = basename(file, ".json").replace("wordchar-", "");
  let payload = JSON.parse(await readFile(join(rawRoot, file), "utf8"));
  if (accessToken && childId) {
    const packageResponse = await fetch(
      `https://api.mumudawang.com/api/v1/lesson_word_characters/${characterId}/package`,
      { headers: { Authorization: `Bearer ${accessToken}`, "Child-Id": childId } },
    );
    if (packageResponse.ok) payload = await packageResponse.json();
  }
  if (!payload.final || !payload.character_resources) continue;
  const folder = join(publicRoot, characterId);
  const stages = [];
  for (const [label, key] of stageSources) {
    const url = payload.character_resources[key];
    if (!url) continue;
    const filename = `stage-${stages.length + 1}.svg`;
    await download(url, join(folder, filename));
    stages.push({ label, src: `/heritage/${characterId}/${filename}` });
  }
  let redBlue;
  if (payload.character_resources.redblue_image_path) {
    redBlue = `/heritage/${characterId}/red-blue.svg`;
    await download(payload.character_resources.redblue_image_path, join(folder, "red-blue.svg"));
  }
  let audio;
  if (payload.audio_path) {
    audio = `/heritage/${characterId}/audio.mp3`;
    await download(payload.audio_path, join(folder, "audio.mp3"));
  }
  records[characterId] = { stages, redBlue, audio };
}

const source = `export type HeritageAsset = {\n  stages: { label: string; src: string }[];\n  redBlue?: string;\n  audio?: string;\n};\n\nexport const heritageAssets: Record<string, HeritageAsset> = ${JSON.stringify(records, null, 2)};\n`;
await writeFile(modulePath, source);
process.stdout.write(`Imported ${Object.keys(records).length} character asset sets.\n`);
