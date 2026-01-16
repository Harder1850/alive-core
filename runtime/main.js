// runtime/main.js
//
// Phase 5: run-once loop closure.
// stdin → intentTranslator → spine.tick → procedure → experience.record → TTS
//
// No loops. No learning. No inference.

import readline from "node:readline";
import fs from "node:fs";

import { listenOnce } from "../capabilities/voice/listen.js";
import { captureOnce } from "../capabilities/voice/mic.js";
import { transcribeOnce } from "../capabilities/voice/stt.js";
import { speakText } from "../capabilities/voice/speak.js";
import { speak } from "../adapters/voice/speak.js";

import { translateTextToIntent } from "./intentTranslator.js";
import { buildWakeNarrative } from "./wakeNarrative.js";
import { loadSessionContext } from "./sessionContext.js";
import { observeSpineTick } from "./spineObserver.js";

import { brainTick } from "./brain/cognitiveLoop.js";

import { Spine } from "../dist/spine/loop.js";

import { getProcedureByIntent } from "../procedures/store.js";

import { initializeRecorder, recordEvent } from "../experience/recorder.js";
import { loadAllEvents } from "../experience/stream.js";
import { initializeStore } from "../memory/memoryStore.js";
import { hasCapability, isAvailable, registerCapability } from "../capabilities/registry.js";

const INPUT_MODE = process.env.ALIVE_INPUT_MODE || "stdin";

function stdinTranscribe() {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("> ", answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function getStdinTextIfPiped() {
  // Deterministic: either stdin is piped and already ended, or we fall back to prompt.
  // No loops; reads at most one line.
  if (process.stdin.isTTY) return null;

  try {
    const buf = await fs.promises.readFile(0, "utf8");
    const line = String(buf).trim();
    return line || null;
  } catch {
    return null;
  }
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
      id: "filesystem.ensureDir",
      name: "Filesystem Ensure Dir",
      type: "software",
      interface: { protocol: "fs", method: "mkdir" },
      availability: "available",
    },
    {
      id: "filesystem.write",
      name: "Filesystem Write",
      type: "software",
      interface: { protocol: "fs", method: "writeFile" },
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

  // ---------------------------------------------------------------------
  // Phase 19: Goal → Intent translation (non-executing; proposal-only)
  // ---------------------------------------------------------------------
  // IMPORTANT: This produces candidate intents for recording only.
  // It must not execute, route, rank, or send intents to the Spine.
  const brain = brainTick({});

  await recordEvent({
    source: "system",
    type: "intent_candidates_proposed",
    payload: {
      count: brain.candidateIntents.length,
      candidates: brain.candidateIntents,
      failures: brain.failures ?? [],
    },
  });

  // ---------------------------------------------------------------------
  // Phase 20: intent arbitration audit event (lawful elimination only)
  // ---------------------------------------------------------------------
  const arbitration = brain.arbitration || { survivingIntents: [], eliminated: [], failures: [] };
  await recordEvent({
    source: "system",
    type: "intent_arbitration_completed",
    payload: {
      inputCount: typeof arbitration.inputCount === "number" ? arbitration.inputCount : 0,
      survivingCount: Array.isArray(arbitration.survivingIntents) ? arbitration.survivingIntents.length : 0,
      eliminated: arbitration.eliminated || [],
      failures: arbitration.failures || [],
    },
  });

  // ---------------------------------------------------------------------
  // Phase 21: intent authorization audit event (lawful permission only)
  // ---------------------------------------------------------------------
  const authorization = brain.authorization || { authorizedIntents: [], denied: [], failures: [] };
  await recordEvent({
    source: "system",
    type: "intent_authorization_completed",
    payload: {
      inputCount: Array.isArray(arbitration.survivingIntents) ? arbitration.survivingIntents.length : 0,
      authorizedCount: Array.isArray(authorization.authorizedIntents)
        ? authorization.authorizedIntents.length
        : 0,
      denied: authorization.denied || [],
      failures: authorization.failures || [],
    },
  });

  const events = loadAllEvents();
  const sessionContext = loadSessionContext(events);

  // Phase 6: wake narrative (read-only, deterministic)
  const wakeMsg = buildWakeNarrative(events);
  console.log(wakeMsg);
  await speakText({ text: wakeMsg, speak });

  // Phase 9: deterministic acknowledgement only (no branching, no memory writes)
  if (sessionContext.turnCount > 0) {
    const lastIntent = sessionContext.recentIntents[sessionContext.recentIntents.length - 1];
    await speakText({
      text: `Earlier, I helped with ${String(lastIntent || "").replaceAll("_", " ")}.`,
      speak,
    });
  }

  // ---------------------------------------------------------------------
  // Phase 15: explicit input mode selector (stdin | voice)
  // ---------------------------------------------------------------------
  if (INPUT_MODE !== "stdin" && INPUT_MODE !== "voice") {
    const msg = `Invalid ALIVE_INPUT_MODE: ${INPUT_MODE}. Use stdin or voice.`;
    console.error("[runtime]", msg);
    await speakText({ text: msg, speak });
    await recordEvent({
      source: "system",
      type: "input_failed",
      payload: { source: INPUT_MODE, reason: "invalid_input_mode" },
    });
    return;
  }

  let text = null;

  if (INPUT_MODE === "stdin") {
    const pipedText = await getStdinTextIfPiped();
    if (pipedText) {
      console.log("[runtime] piped input:", pipedText);
    }
    const inputEvt = pipedText
      ? { source: "human", type: "input", payload: { text: pipedText } }
      : await listenOnce({ transcribe: stdinTranscribe });
    await recordEvent({ source: "human", type: "input", payload: inputEvt.payload });
    text = inputEvt.payload.text;
  } else {
    // voice mode: exactly one capture -> one transcription -> one decision -> exit
    try {
      if (!isAvailable("voice.mic.captureOnce")) throw new Error("capability missing: voice.mic.captureOnce");
      if (!isAvailable("voice.stt.transcribeOnce")) throw new Error("capability missing: voice.stt.transcribeOnce");

      const audio = await captureOnce({ maxMs: 6000 });
      const transcript = await transcribeOnce(audio);
      if (!transcript || !String(transcript).trim()) throw new Error("transcription empty");

      text = String(transcript).trim();

      await recordEvent({
        source: "system",
        type: "input_received",
        payload: { source: "voice", text },
      });
    } catch (err) {
      const reason = String(err?.message || err);
      const msg = `Voice input failed: ${reason}`;
      console.error("[runtime]", msg);
      await speakText({ text: msg, speak });
      await recordEvent({
        source: "system",
        type: "input_failed",
        payload: { source: "voice", reason },
      });
      return;
    }
  }

  if (!text) {
    const msg = "No input received.";
    await speakText({ text: msg, speak });
    await recordEvent({ source: "system", type: "input_failed", payload: { source: INPUT_MODE, reason: "empty" } });
    return;
  }

  const intentObj = translateTextToIntent(text);

  const turnId = `turn_${Date.now()}`;
  await recordEvent({
    source: "system",
    type: "session_turn_started",
    payload: { timestamp: Date.now() },
  });

  // Spine sees intent only (no raw language).
  // Real spine execution (Phase 10): run one tick.
  // No new behavior intended: this makes the existing spine executable.
  const spine = new Spine();
  await observeSpineTick({ intent: intentObj, spine, recordEvent });

  const firstIntent = Array.isArray(intentObj?.intents) ? intentObj.intents[0] : undefined;
  const procedure = getProcedureByIntent(firstIntent);
  if (!procedure) {
    const msg = "I don’t know how to do that yet.";
    console.log(msg);
    await speakText({ text: msg, speak });
    await recordEvent({ source: "system", type: "procedure_not_found", payload: { turnId, intent: firstIntent } });
    await recordEvent({
      source: "system",
      type: "session_turn_ended",
      payload: { intent: firstIntent, result: null },
    });
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
      turnId,
      procedureId: procedure.id,
      intent: procedure.intent,
      result,
    },
  });

  // Phase 8: explicit demo site chaining (no background work)
  const DEMO_WORTHY_INTENTS = new Set([
    "organize_downloads",
    "generate_demo_site",
  ]);

  let demoUpdated = false;
  if (DEMO_WORTHY_INTENTS.has(procedure.intent) && procedure.intent !== "generate_demo_site") {
    const demoProc = getProcedureByIntent("generate_demo_site");
    if (!demoProc) {
      throw new Error("demo chaining failed: generate_demo_site procedure not found");
    }

    if (demoProc.required_capabilities) {
      for (const capId of demoProc.required_capabilities) {
        if (!capabilities.isAvailable(capId)) {
          throw new Error(`missing capability: ${capId}`);
        }
      }
    }

    const demoResult = await demoProc.execute({ capabilities, output });
    demoUpdated = true;

    await recordEvent({
      source: "system",
      type: "procedure_executed",
      payload: {
        turnId,
        procedureId: demoProc.id,
        intent: demoProc.intent,
        result: demoResult,
      },
    });
  }

  const summary = result && typeof result === "object" && "moved" in result
    ? `I organized your Downloads folder and moved ${result.moved} files. ${demoUpdated ? "I updated my demo." : ""}`.trim()
    : `I completed the task. ${demoUpdated ? "I updated my demo." : ""}`.trim();

  await speakText({ text: summary, speak });

  await recordEvent({
    source: "system",
    type: "session_turn_ended",
    payload: {
      intent: procedure.intent,
      result,
    },
  });
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  runOnce().catch(err => {
    console.error("[runtime] error:", err?.message || err);
    process.exitCode = 1;
  });
}
