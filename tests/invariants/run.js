import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const dir = path.resolve("tests/invariants");

fs.readdirSync(dir)
  .filter(f => f.endsWith(".test.js"))
  .sort()
  .forEach(f => {
    console.log(`\nRunning ${f}`);
    import(pathToFileURL(path.join(dir, f)).href);
  });
