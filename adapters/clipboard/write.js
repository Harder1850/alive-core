// adapters/clipboard/write.js

import { execSync } from "node:child_process";

export function writeClipboard(text) {
  if (!text || typeof text !== "string") return;

  try {
    if (process.platform === "darwin") {
      execSync(`printf %s ${JSON.stringify(text)} | pbcopy`);
    } else if (process.platform === "win32") {
      // Use PowerShell variable assignment to avoid argument splitting.
      const ps = `$t = ${JSON.stringify(text)}; Set-Clipboard -Value $t;`;
      execSync(`powershell -Command "${ps}"`);
    } else {
      execSync(`printf %s ${JSON.stringify(text)} | xclip -selection clipboard`);
    }
  } catch {
    // silent failure
  }
}
