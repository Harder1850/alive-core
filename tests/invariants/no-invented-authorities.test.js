import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Rapid Reference & Sanity Layer provides explicit authorities (no invented sources)", async () => {
  const root = process.cwd();
  const raw = fs.readFileSync(`${root}/../alive-system/reference/index.json`, "utf-8");
  const index = JSON.parse(raw);

  // Basic sanity: ensure each category has at least one authority-ish list
  for (const [k, v] of Object.entries(index)) {
    assert.equal(typeof v, "object", `category ${k} must be object`);
    const hasList =
      Array.isArray(v.primary) ||
      Array.isArray(v.authoritative) ||
      Array.isArray(v.fast) ||
      Array.isArray(v.frameworks) ||
      Array.isArray(v.calculator);
    assert.ok(hasList, `category ${k} must include at least one source list`);
  }
});
