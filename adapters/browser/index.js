// adapters/browser/index.js

import { exec } from "child_process";

export function search(query) {
  exec(
    `start "" "https://www.google.com/search?q=${encodeURIComponent(query)}"`
  );
}

