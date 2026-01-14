// capabilities/voice/mic.js
//
// Phase 15: one-shot microphone capture.
//
// HARD RULES:
// - No background listening
// - No continuous recording
// - No loops
//
// This capability is intentionally minimal. It only attempts to capture a
// single utterance and returns a buffer-like payload.

import { execSync } from "node:child_process";

/**
 * captureOnce({ maxMs }?)
 *
 * @param {{ maxMs?: number }} [opts]
 * @returns {Promise<{ audio: Buffer, format: { mime: string } }>}
 */
export async function captureOnce(opts = {}) {
  const maxMs = Number.isFinite(opts.maxMs) ? opts.maxMs : 5000;

  // Local-only best-effort implementation.
  // We do NOT include any auto-install or cloud fallback.
  //
  // Windows: requires ffmpeg available on PATH.
  // macOS: requires ffmpeg available on PATH.
  // Linux: requires ffmpeg available on PATH.

  const tmpFile = `./.alive-audio-${Date.now()}.wav`;

  try {
    // ffmpeg recording commands differ by OS input device. We keep this simple
    // and explicit: if it fails, the runtime will surface a clear error.
    if (process.platform === "win32") {
      // Uses default audio device. Users may need to configure ffmpeg dshow.
      // This is intentionally not a robust device selector.
      execSync(
        `ffmpeg -y -hide_banner -loglevel error -f dshow -i audio=default -t ${maxMs / 1000} ${tmpFile}`,
        { stdio: "ignore" }
      );
    } else if (process.platform === "darwin") {
      // avfoundation device indices vary.
      execSync(
        `ffmpeg -y -hide_banner -loglevel error -f avfoundation -i ":0" -t ${maxMs / 1000} ${tmpFile}`,
        { stdio: "ignore" }
      );
    } else {
      // ALSA default device.
      execSync(
        `ffmpeg -y -hide_banner -loglevel error -f alsa -i default -t ${maxMs / 1000} ${tmpFile}`,
        { stdio: "ignore" }
      );
    }
  } catch (err) {
    throw new Error("mic not available");
  }

  // Read file after capture.
  const fs = await import("node:fs");
  try {
    const audio = fs.readFileSync(tmpFile);
    // Clean up. Best-effort.
    try { fs.unlinkSync(tmpFile); } catch {}
    return { audio, format: { mime: "audio/wav" } };
  } catch {
    try { fs.unlinkSync(tmpFile); } catch {}
    throw new Error("mic capture failed");
  }
}

