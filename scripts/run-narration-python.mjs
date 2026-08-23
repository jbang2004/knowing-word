import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const [tool, ...args] = process.argv.slice(2);
const allowed = new Map([
  ["generate", "generate-qwen3-narration.py"],
  ["verify", "verify-qwen3-narration.py"],
  ["toolchain", "validate-narration-toolchain.py"],
]);
if (!allowed.has(tool)) throw new Error("Usage: node scripts/run-narration-python.mjs <generate|verify|toolchain> [...args]");

const projectRoot = resolve(import.meta.dirname, "..");
const localPython = join(projectRoot, ".venv/bin/python");
const interpreter = process.env.QWEN3_TTS_PYTHON
  || (existsSync(localPython) ? localPython : "python3");
const script = join(projectRoot, "scripts", allowed.get(tool));
const result = spawnSync(interpreter, [script, ...args], { stdio: "inherit" });
if (result.error) {
  throw new Error(`无法启动 ${interpreter}。可用 QWEN3_TTS_PYTHON 指向已安装 mlx-audio 的 Python。`, { cause: result.error });
}
process.exitCode = result.status ?? 1;
