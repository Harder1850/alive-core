// procedures/organizeDownloads.js
//
// Procedure: Organize Downloads Folder
// - Deterministic allowlist by extension.
// - Non-recursive.
// - No deletion, no renames (only moves).
// - Leaves unknown extensions untouched.
//
// NOTE: Experience recording must happen outside this module.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const FOLDERS = {
  pdf: "pdf",
  images: "images",
  archives: "archives",
  installers: "installers",
  docs: "docs",
};

/** @type {Record<string, keyof typeof FOLDERS>} */
const EXTENSION_MAP = {
  ".pdf": "pdf",

  ".png": "images",
  ".jpg": "images",
  ".jpeg": "images",
  ".gif": "images",
  ".webp": "images",

  ".zip": "archives",
  ".rar": "archives",
  ".7z": "archives",
  ".tar": "archives",
  ".gz": "archives",

  ".exe": "installers",
  ".msi": "installers",
  ".dmg": "installers",
  ".pkg": "installers",

  ".doc": "docs",
  ".docx": "docs",
  ".txt": "docs",
  ".md": "docs",
  ".rtf": "docs",
};

function resolveDownloadsDir() {
  // Explicit, deterministic resolution (no guessing beyond OS convention).
  return path.join(os.homedir(), "Downloads");
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

function safeMoveFile(fromPath, toDir) {
  const base = path.basename(fromPath);
  const toPath = path.join(toDir, base);
  if (fromPath === toPath) return { moved: false, toPath };

  // Fail loudly on collision.
  if (fs.existsSync(toPath)) {
    throw new Error(`destination already exists: ${toPath}`);
  }

  fs.renameSync(fromPath, toPath);
  return { moved: true, toPath };
}

export const organizeDownloadsProcedure = {
  id: "proc_organize_downloads",
  intent: "organize_downloads",
  required_capabilities: ["filesystem.move", "filesystem.list", "output.text"],

  steps: [
    { id: "resolve_downloads", action: "filesystem.resolve_downloads" },
    { id: "scan", action: "filesystem.list_non_recursive" },
    { id: "create_folders", action: "filesystem.ensure_folders" },
    { id: "move_files", action: "filesystem.move_allowlist" },
    { id: "report", action: "output.report" },
  ],

  execute({ capabilities, output } = {}) {
    // Capability checks (fail loudly)
    if (!capabilities || typeof capabilities.isAvailable !== "function") {
      throw new Error("procedure requires capabilities.isAvailable(id)");
    }
    if (!capabilities.isAvailable("filesystem.list")) throw new Error("missing capability: filesystem.list");
    if (!capabilities.isAvailable("filesystem.move")) throw new Error("missing capability: filesystem.move");
    if (!capabilities.isAvailable("output.text")) throw new Error("missing capability: output.text");
    if (!output || typeof output.emit !== "function") throw new Error("procedure requires output.emit(text)");

    const downloadsDir = resolveDownloadsDir();
    if (!fs.existsSync(downloadsDir)) {
      throw new Error(`Downloads folder not found: ${downloadsDir}`);
    }

    const entries = fs.readdirSync(downloadsDir, { withFileTypes: true });
    const files = entries.filter(e => e.isFile()).map(e => e.name);

    /** @type {string[]} */
    const createdFolders = [];
    const folderPaths = {};
    for (const key of Object.keys(FOLDERS)) {
      const folderName = FOLDERS[key];
      const full = path.join(downloadsDir, folderName);
      folderPaths[key] = full;
      if (ensureDir(full)) createdFolders.push(folderName);
    }

    const movedFiles = [];
    const skippedFiles = [];

    for (const filename of files) {
      const ext = path.extname(filename).toLowerCase();
      const bucket = EXTENSION_MAP[ext];
      if (!bucket) {
        skippedFiles.push(filename);
        continue;
      }

      const fromPath = path.join(downloadsDir, filename);
      const toDir = folderPaths[bucket];
      const { moved, toPath } = safeMoveFile(fromPath, toDir);
      if (moved) movedFiles.push({ from: fromPath, to: toPath });
    }

    const result = {
      downloadsDir,
      moved: movedFiles.length,
      skipped: skippedFiles.length,
      createdFolders,
      movedFiles,
      skippedFiles,
    };

    output.emit(
      `I organized your Downloads folder. I moved ${result.moved} files into categorized folders and skipped ${result.skipped} files that didn’t match my rules.`
    );

    return result;
  },
};

