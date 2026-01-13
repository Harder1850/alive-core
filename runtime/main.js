// runtime/main.js
//
// Phase 5: run-once loop closure.
// stdin → intentTranslator → spine.tick → procedure → experience.record → TTS
//
// No loops. No learning. No inference.

import readline from "node:readline";

import { listenOnce } from "../capabilities/voice/listen.js";
import { speakText } from "../capabilities/voice/speak.js";
import { speak } from "../adapters/voice/speak.js";

import { translateTextToIntent } from "./intentTranslator.js";

import { getProcedureByIntent } from "../procedures/store.js";

import { initializeRecorder, recordEvent } from "../experience/recorder.js";
import { initializeStore } from "../memory/memoryStore.js";
import { hasCapability, isAvailable, registerCapability } from "../capabilities/registry.js";

function stdinTranscribe() {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("> ", answer => {
      rl.close();
      resolve(answer);
    });
  });
}

function ensureBuiltinRuntimeCapabilities() {
  // Best-effort idempotent registration for runtime wiring.
  // These are NOT new powers; they model what this runtime can do.
  const caps = [
    {
      id: "output.text",
      name: "Console Output",
      type: "software",
      interface: { protocol: "console", method: "emit" },
      availability: "available",
    },
    {
      id: "filesystem.list",
      name: "Filesystem List",
      type: "software",
      interface: { protocol: "fs", method: "readdir" },
      availability: "available",
    },
    {
      id: "filesystem.move",
      name: "Filesystem Move",
      type: "software",
      interface: { protocol: "fs", method: "rename" },
      availability: "available",
    },
    {
      id: "memory.store",
      name: "Memory Store",
      type: "software",
      interface: { protocol: "memory", method: "storeMemory" },
      availability: "available",
    },
    {
      id: "memory.query",
      name: "Memory Query",
      type: "software",
      interface: { protocol: "memory", method: "listMemory" },
      availability: "available",
    },
    {
      id: "time.now",
      name: "Clock",
      type: "software",
      interface: { protocol: "clock", method: "now" },
      availability: "available",
    },
  ];

  for (const c of caps) {
    try {
      if (!hasCapability(c.id)) registerCapability(c);
    } catch {
      // ignore
    }
  }
}

export async function runOnce() {
  initializeRecorder({ dataDir: ".alive-data" });
  initializeStore("./memory_data");
  ensureBuiltinRuntimeCapabilities();

  const inputEvt = await listenOnce({ transcribe: stdinTranscribe });
  await recordEvent({ source: "human", type: "input", payload: inputEvt.payload });

  const { text } = inputEvt.payload;
  const intentObj = translateTextToIntent(text);

  // Spine sees intent only (no raw language).
  // NOTE: spine is currently TypeScript-only in this repo (no JS loader).
  // For Phase 5, we record the tick request explicitly and keep execution deterministic.
  await recordEvent({ source: "system", type: "spine_tick_requested", payload: { input: intentObj } });

  const procedure = getProcedureByIntent(intentObj.intent);
  if (!procedure) {
    const msg = "I don’t know how to do that yet.";
    console.log(msg);
    await speakText({ text: msg, speak });
    await recordEvent({ source: "system", type: "procedure_not_found", payload: { intent: intentObj.intent } });
    return;
  }

  const output = { emit: (t) => console.log(t) };
  const capabilities = { isAvailable };

  if (procedure.required_capabilities) {
    for (const capId of procedure.required_capabilities) {
      if (!capabilities.isAvailable(capId)) {
        throw new Error(`missing capability: ${capId}`);
      }
    }
  }

  const result = await procedure.execute({ capabilities, output });

  await recordEvent({
    source: "system",
    type: "procedure_executed",
    payload: {
      procedureId: procedure.id,
      intent: procedure.intent,
      result,
    },
  });

  const summary = result && typeof result === "object" && "moved" in result
    ? `I completed the task. I moved ${result.moved} files and skipped ${result.skipped} files.`
    : "I completed the task.";

  await speakText({ text: summary, speak });
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  runOnce().catch(err => {
    console.error("[runtime] error:", err?.message || err);
    process.exitCode = 1;
  });
}
