// adapters/clipboard/index.js

import { exec } from "child_process";

export function copy(text) {
  exec(`echo ${text.replace(/"/g, '\\"')} | clip`);
}

export function paste() {
  return new Promise(res => {
    exec(`powershell Get-Clipboard`, (_, out) => res(out.trim()));
  });
}

