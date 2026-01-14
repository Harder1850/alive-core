// scripts/fix-spine-imports.mjs
//
// Phase 10: TS → JS bridge for spine runtime execution.
//
// Node ESM requires explicit file extensions for relative imports.
// The spine TypeScript sources use extensionless relative imports ("./ingress").
// We are NOT allowed to edit /spine, so we rewrite only the generated dist output.

import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist", "spine");

if (!fs.existsSync(distDir)) {
  console.error(`[fix-spine-imports] dist directory not found: ${distDir}`);
  process.exit(1);
}

const jsFiles = fs.readdirSync(distDir).filter(f => f.endsWith(".js"));

for (const file of jsFiles) {
  const full = path.join(distDir, file);
  const src = fs.readFileSync(full, "utf8");

  // More direct and safe: replace "./name" where name has no dot and isn't a directory.
  // This covers both `import ... from "./x";` and `export ... from "./x";`.
  const rewritten = src.replace(
    /(from\s+["'])(\.\/[A-Za-z0-9_\-/]+)(["'])/g,
    (_m, p1, spec, p3) => {
      // already has an extension
      if (path.posix.extname(spec) || path.win32.extname(spec)) return `${p1}${spec}${p3}`;
      return `${p1}${spec}.js${p3}`;
    }
  );

  if (rewritten !== src) {
    fs.writeFileSync(full, rewritten, "utf8");
  }
}

console.log(`[fix-spine-imports] updated ${jsFiles.length} file(s) in ${distDir}`);
