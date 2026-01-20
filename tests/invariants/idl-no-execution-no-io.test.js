import fs from "fs";
import path from "path";
import assert from "assert";

const IDL_DIR = path.resolve("kernel", "dialogue");

// Hard forbidden tokens for the IDL implementation.
// This is intentionally coarse-grained to fail fast.
const FORBIDDEN_TOKENS = [
  // Execution / spine
  "runtime/execution",
  "adapters/",
  "procedures/",
  "spine/",
  "new Spine",
  "egress(",
  "ingress(",
  "arbitrate(",
  "authorize",

  // I/O
  "fs",
  "fetch(",
  "http",
  "https",
  "clipboard",
  "notifications",
  "voice",
  "browser",
  "windows",

  // Timers
  "setInterval",
  "setTimeout",
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  // Contracts may mention forbidden modules as text; invariants target implementation files.
  if (filePath.endsWith("IDL.contract.ts")) return;
  for (const token of FORBIDDEN_TOKENS) {
    assert(
      !content.includes(token),
      `Invariant violation: IDL contains forbidden token "${token}" in ${filePath}`
    );
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

walk(IDL_DIR);
console.log("✔ idl-no-execution-no-io invariant holds");
