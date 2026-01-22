import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Science & Technology Intuition Stack is repo-versioned and runtime-readonly", async () => {
  const root = process.cwd();
  const scienceDir = `${root}/../alive-system/science`;

  assert.ok(fs.existsSync(scienceDir), "alive-system/science must exist");
  assert.ok(
    fs.existsSync(`${scienceDir}/README.md`),
    "alive-system/science/README.md must exist"
  );

  // No runtime persistence for science stack.
  assert.ok(
    !fs.existsSync(`${root}/../alive-system/.alive-data/science.json`),
    "science stack must not write runtime data"
  );
});

