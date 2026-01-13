// adapters/windows/index.js

import fs from "fs";
import path from "path";
import { exec } from "child_process";

function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve(String(stdout || "").trim());
    });
  });
}

export function listFiles(targetPath) {
  const full = targetPath ? path.resolve(targetPath) : process.cwd();
  return fs.readdirSync(full);
}

export function readFile(targetPath) {
  return fs.readFileSync(path.resolve(targetPath), "utf-8");
}

export function writeFile(targetPath, content) {
  fs.writeFileSync(path.resolve(targetPath), content, "utf-8");
}

export async function openApp(app) {
  // Allow simple names like "notepad" or full paths.
  // Using cmd start keeps it simple and Windows-native.
  const safe = String(app || "").trim();
  if (!safe) throw new Error("openApp requires an app name or path");
  await execAsync(`cmd /c start "" "${safe}"`);
}

export async function runCommand(cmd) {
  // v0.1 sandbox: very small allowlist.
  const raw = String(cmd || "").trim();
  if (!raw) throw new Error("runCommand requires a command");

  const allow = ["dir", "echo", "type", "cd", "pwd", "whoami"];
  const first = raw.split(/\s+/)[0].toLowerCase();
  if (!allow.includes(first)) {
    throw new Error(`Command not allowed: ${first}`);
  }

  return await execAsync(`cmd /c ${raw}`);
}

