/**
 * adapters/voice/speak.js
 *
 * Optional text-to-speech adapter.
 * Safe to import at runtime only.
 */

import { execSync } from "node:child_process";

export function speak(text) {
  if (!text || typeof text !== "string") return;

  try {
    // Cross-platform best-effort TTS
    if (process.platform === "darwin") {
      // macOS
      execSync(`say ${JSON.stringify(text)}`);
    } else if (process.platform === "win32") {
      // Windows (PowerShell)
      const ps = `
        Add-Type -AssemblyName System.Speech;
        $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
        $speak.Speak(${JSON.stringify(text)});
      `;
      execSync(`powershell -Command "${ps}"`);
    } else {
      // Linux fallback (espeak if installed)
      execSync(`espeak ${JSON.stringify(text)}`);
    }
  } catch {
    // Silent failure — voice is optional
  }
}

