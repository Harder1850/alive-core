import fs from "fs";
import path from "path";
import assert from "assert";

const SPINE_DIR = path.resolve("spine");

let loopCount = 0;

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  if (
    content.includes("while (true)") ||
    content.includes("for (;;)") ||
    content.includes("setInterval") ||
    content.includes("setTimeout")
  ) {
    loopCount++;
  }
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

assert(
  loopCount <= 1,
  `Invariant violation: ${loopCount} loops detected in spine (only one allowed)`
);

console.log("✔ single-loop invariant holds");
