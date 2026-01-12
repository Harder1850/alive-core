import fs from "fs";
import path from "path";
import assert from "assert";

const SPINE_DIR = path.resolve("spine");

const ALLOWED_IMPORT_PREFIXES = [
  "./",
  "../",
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const importLines = content.split("\n").filter(l => l.startsWith("import "));
  importLines.forEach(line => {
    const match = line.match(/from\s+['\"](.*)['\"]/);
    if (!match) return;

    const source = match[1];
    const allowed = ALLOWED_IMPORT_PREFIXES.some(p =>
      source.startsWith(p)
    );

    assert(
      allowed,
      `Invariant violation: external import "${source}" in spine file ${filePath}`
    );
  });
}

function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith(".ts")) {
      scanFile(fullPath);
    }
  });
}

walk(SPINE_DIR);

console.log("✔ no-external-imports invariant holds");
