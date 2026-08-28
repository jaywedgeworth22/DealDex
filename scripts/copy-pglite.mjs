import { copyFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const pgliteDist = join(ROOT, "node_modules", "@electric-sql", "pglite", "dist");
const filesToCopy = ["pglite.data", "pglite.wasm", "initdb.wasm"];

function findLibsDirs(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_libs") {
        results.push(fullPath);
      } else {
        results.push(...findLibsDirs(fullPath));
      }
    }
  }
  return results;
}

const vercelOutput = join(ROOT, ".vercel", "output", "functions");
const libsDirs = findLibsDirs(vercelOutput);

for (const targetDir of libsDirs) {
  for (const file of filesToCopy) {
    const src = join(pgliteDist, file);
    const dest = join(targetDir, file);
    if (existsSync(src)) {
      copyFileSync(src, dest);
      console.log(`[copy-pglite] Copied ${file} -> ${targetDir}`);
    }
  }
}
