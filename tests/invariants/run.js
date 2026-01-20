import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const dir = path.resolve("tests/invariants");

const files = fs.readdirSync(dir)
  .filter(f => f.endsWith(".test.js"))
  .sort();

for (const f of files) {
  console.log(`\nRunning ${f}`);
  // Ensure invariant tests run sequentially (some touch shared local test state).
  // eslint-disable-next-line no-await-in-loop
  await import(pathToFileURL(path.join(dir, f)).href);
}
