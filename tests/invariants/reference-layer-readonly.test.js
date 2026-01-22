import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Rapid Reference & Sanity Layer is repo-versioned and runtime-readonly (no mutation)", async () => {
  const root = process.cwd();

  // Ensure reference index exists (repo versioned)
  const indexPath = `${root}/../alive-system/reference/index.json`;
  assert.ok(fs.existsSync(indexPath), "alive-system/reference/index.json must exist");

  // Ensure no runtime data directory for reference
  assert.ok(
    !fs.existsSync(`${root}/../alive-system/.alive-data/reference.json`),
    "reference layer must not write runtime data"
  );
});
