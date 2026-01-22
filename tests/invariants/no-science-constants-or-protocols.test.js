import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

test("Science stack contains no constants, dosages, or step-by-step protocols", async () => {
  const root = process.cwd();
  const scienceDir = `${root}/../alive-system/science`;
  const files = walk(scienceDir).filter((p) => p.endsWith(".md"));

  // Guardrail patterns: block obvious constant/protocol forms.
  // This is intentionally conservative and may be refined later.
  const forbidden = [
    /\bmg\b/i,
    /\bmcg\b/i,
    /\bml\b/i,
    /\bIU\b/, // dosage units
    /\bstep\s*\d+\b/i,
    /\bprocedure\b/i,
    /\bprotocol\b/i,
    /\bconstant\b/i,
    /\bN\/A\b/i,
    /\b9\.81\b/, // example gravity constant
    /\b6\.022\b/, // Avogadro-like
  ];

  for (const f of files) {
    const text = fs.readFileSync(f, "utf-8");
    for (const rx of forbidden) {
      assert.ok(
        !rx.test(text),
        `Forbidden pattern ${rx} found in ${path.relative(process.cwd(), f)}`
      );
    }
  }
});

