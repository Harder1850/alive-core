// adapters/filesystem/index.js

import fs from "fs";

export function searchFiles(dir, pattern) {
  return fs.readdirSync(dir).filter(f => f.includes(pattern));
}

export function deleteFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("File does not exist");
  }
  fs.unlinkSync(filePath);
  return true;
}
