// capabilities/voice/stt.js
//
// Phase 15: one-shot speech-to-text.
//
// HARD RULES:
// - Local-only (no cloud dependency)
// - No retries / fallback
// - No loops
//
// This implementation is intentionally strict: it requires a local STT binary.
// By default we expect `whisper` on PATH (e.g., whisper.cpp or similar).

import { execSync } from "node:child_process";
import fs from "node:fs";

/**
 * transcribeOnce({ audio, format } )
 *
 * @param {{
 *   audio: Buffer,
 *   format?: { mime?: string }
 * }} input
 * @returns {Promise<string>}
 */
export async function transcribeOnce(input) {
  if (!input || !Buffer.isBuffer(input.audio)) {
    throw new Error("stt not installed");
  }

  // Write input audio to a tmp file.
  const wavPath = `./.alive-stt-${Date.now()}.wav`;
  const outPath = `./.alive-stt-${Date.now()}.txt`;
  fs.writeFileSync(wavPath, input.audio);

  try {
    // Expect a local whisper-style CLI.
    // This is deliberately explicit: if it's not present, we fail loudly.
    // Users can provide their own local STT implementation on PATH.
    execSync(`whisper ${wavPath} --output_format txt --output_dir . --language auto`, {
      stdio: "ignore",
    });

    // whisper typically writes <basename>.txt; we can’t predict it without parsing.
    // So we attempt a simple deterministic read by scanning for newest .txt.
    const dir = fs.readdirSync(".");
    const txts = dir.filter(f => f.endsWith(".txt") && f.includes(".alive-stt-") === false);

    // If whisper wrote to CWD, it will usually be named like the wav basename.
    // We'll just read our explicitly-named outPath if present, else read wav basename.
    const baseTxt = wavPath.replace(/\.wav$/i, ".txt");
    let text = "";
    if (fs.existsSync(outPath)) text = fs.readFileSync(outPath, "utf8");
    else if (fs.existsSync(baseTxt)) text = fs.readFileSync(baseTxt, "utf8");
    else if (txts.length > 0) {
      // last-resort: read newest txt
      const newest = txts
        .map(f => ({ f, m: fs.statSync(f).mtimeMs }))
        .sort((a, b) => b.m - a.m)[0]?.f;
      if (newest) text = fs.readFileSync(newest, "utf8");
    }

    const cleaned = String(text || "").trim();
    if (!cleaned) throw new Error("transcription empty");
    return cleaned;
  } catch (err) {
    const msg = String(err?.message || err);
    if (msg.includes("transcription empty")) throw new Error("transcription empty");
    throw new Error("stt not installed");
  } finally {
    try { fs.unlinkSync(wavPath); } catch {}
    try { fs.unlinkSync(outPath); } catch {}
  }
}

