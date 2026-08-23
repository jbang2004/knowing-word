import { readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const clientRoot = join(root, "dist/client");

const budgets = [
  {
    label: "single client JavaScript chunk",
    match: (path) => path.endsWith(".js"),
    maxBytes: 450_000,
  },
  {
    label: "single client stylesheet",
    match: (path) => path.endsWith(".css"),
    maxBytes: 180_000,
  },
];

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  }));
  return nested.flat();
}

let files;
try {
  files = await filesBelow(clientRoot);
} catch {
  throw new Error("Production output is missing. Run `npm run build` before the bundle budget check.");
}

const violations = [];
const legacyEngine = files.find((path) => /(?:^|\/)experience-[^/]+\.js$/u.test(path));
if (legacyEngine) violations.push(`legacy full-route client bundle returned: ${relative(root, legacyEngine)}`);

for (const budget of budgets) {
  const candidates = files.filter(budget.match);
  for (const path of candidates) {
    const { size } = await stat(path);
    if (size > budget.maxBytes) {
      violations.push(
        `${budget.label}: ${relative(root, path)} is ${size.toLocaleString()} bytes; budget is ${budget.maxBytes.toLocaleString()} bytes`,
      );
    }
  }
}

const clientJavaScript = files.filter((path) => path.endsWith(".js"));
const totalJavaScriptBytes = (
  await Promise.all(clientJavaScript.map(async (path) => (await stat(path)).size))
).reduce((total, size) => total + size, 0);
if (totalJavaScriptBytes > 1_800_000) {
  violations.push(
    `total client JavaScript is ${totalJavaScriptBytes.toLocaleString()} bytes; budget is 1,800,000 bytes`,
  );
}

if (violations.length) {
  process.stderr.write(`${violations.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Production bundle budgets passed.\n");
}
