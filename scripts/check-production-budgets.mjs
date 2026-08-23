import { readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const clientRoot = join(root, "dist/client");

const budgets = [
  {
    label: "single client JavaScript chunk",
    match: (path) => path.endsWith(".js"),
    maxBytes: 3_400_000,
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

if (violations.length) {
  process.stderr.write(`${violations.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Production bundle budgets passed.\n");
}
