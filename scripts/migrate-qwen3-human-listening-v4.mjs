import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
} from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import { prepareHumanListening } from "./prepare-qwen3-human-listening.mjs";

function usage() {
  return "Usage: node scripts/migrate-qwen3-human-listening-v4.mjs "
    + "<approved-book.json> <qwen-manifest.json> <legacy-v3-human-listening.json> "
    + "<new-output-directory> --confirm-legacy-visuals-unchanged";
}

async function exists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  if (!args.includes("--confirm-legacy-visuals-unchanged")) {
    throw new Error(
      "迁移 v3 听审必须由审核人明确确认当前视觉资源就是原看审版本；"
      + "确认后传入 --confirm-legacy-visuals-unchanged",
    );
  }
  const unknownFlags = args.filter(arg => arg.startsWith("-") && arg !== "--confirm-legacy-visuals-unchanged");
  if (unknownFlags.length) throw new Error(`未知参数：${unknownFlags.join(", ")}\n${usage()}`);
  const positional = args.filter(arg => !arg.startsWith("-"));
  if (positional.length !== 4) throw new Error(usage());

  const [bookArg, manifestArg, legacyArg, outputArg] = positional;
  const legacyPath = resolve(legacyArg);
  const outputPath = resolve(outputArg);
  const legacy = JSON.parse(await readFile(legacyPath, "utf8"));
  if (
    legacy.version !== "qwen3-human-listening-v3"
    || legacy.status !== "complete"
    || !legacy.reviewer
  ) {
    throw new Error("迁移源必须是已完成且有审核人签名的 qwen3-human-listening-v3");
  }
  if (await exists(outputPath)) throw new Error(`迁移目标必须是全新目录：${outputPath}`);

  await mkdir(dirname(outputPath), { recursive: true });
  const tempPath = await mkdtemp(join(dirname(outputPath), `.${basename(outputPath)}.tmp-`));
  try {
    const result = await prepareHumanListening({
      bookPath: resolve(bookArg),
      manifestPath: resolve(manifestArg),
      outputDirectory: tempPath,
      previousListeningPath: legacyPath,
      confirmLegacyVisualsUnchanged: true,
    });
    if (result.pendingRecordCount !== 0 || result.carriedRecordCount !== result.recordCount) {
      throw new Error(
        `旧听审证据不能完整迁移：${result.carriedRecordCount} 条匹配，`
        + `${result.pendingRecordCount} 条必须重新人工听审`,
      );
    }
    await copyFile(legacyPath, join(tempPath, "human-listening.v3.backup.json"));
    await rename(tempPath, outputPath);
    process.stdout.write(
      `Migrated ${result.recordCount} records to qwen3-human-listening-v4.\n`
      + `Output: ${join(outputPath, "human-listening.json")}\n`
      + `Legacy backup: ${join(outputPath, "human-listening.v3.backup.json")}\n`,
    );
  } finally {
    await rm(tempPath, { recursive: true, force: true });
  }
}

main().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
