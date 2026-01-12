import fs from "fs";
import path from "path";
import assert from "assert";

const SPINE_DIR = path.resolve("spine");

const FORBIDDEN_TOKENS = [
  "async ",
  "await ",
  "setTimeout",
  "setInterval",
  "setImmediate",
  "fs.",
  "http",
  "https",
  "fetch(",
  "XMLHttpRequest",
  "child_process",
  "process.exit",
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  FORBIDDEN_TOKENS.forEach(token => {
    assert(
      !content.includes(token),
      `Invariant violation: "${token}" found in spine file ${filePath}`
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

console.log("✔ spine-no-blocking invariant holds");
