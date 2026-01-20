// experience/recorder.js

import fs from "node:fs";
import path from "node:path";
import { createBaseEvent, validateEvent } from "./schema.js";

let _initialized = false;
let _dataDir = null;
let _eventsFile = null;

// Phase 25: in-memory registration cache for semantic validation context.
// This is derived from the append-only log and is replay-safe.
let _cachedEvents = [];

// simple write queue (prevents concurrent appends from interleaving)
let _queue = Promise.resolve();

export function getDataDir() {
  if (!_dataDir) throw new Error("experience recorder not initialized");
  return _dataDir;
}

export function getEventsFilePath() {
  if (!_eventsFile) throw new Error("experience recorder not initialized");
  return _eventsFile;
}

export function isInitialized() {
  return _initialized;
}

export function initializeRecorder({ dataDir = ".alive-data", filename = "events.jsonl" } = {}) {
  // Persistence location (auditable / inspectable):
  // - Default: <process.cwd()>/.alive-data/events.jsonl
  // - Override: set ALIVE_DATA_DIR (absolute or relative)
  //
  // This MUST remain deterministic and append-only.
  const effectiveDir = process.env.ALIVE_DATA_DIR || dataDir;

  _dataDir = path.resolve(process.cwd(), effectiveDir);
  _eventsFile = path.join(_dataDir, filename);

  fs.mkdirSync(_dataDir, { recursive: true });
  if (!fs.existsSync(_eventsFile)) fs.writeFileSync(_eventsFile, "", "utf8");

  // Load existing events into memory for deterministic schema-level validation context.
  try {
    const txt = fs.readFileSync(_eventsFile, "utf8");
    _cachedEvents = txt
      .split("\n")
      .filter(Boolean)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    _cachedEvents = [];
  }

  _initialized = true;
  return { dataDir: _dataDir, eventsFile: _eventsFile };
}

/**
 * EXPERIENCE INVARIANT:
 * Events are append-only. Never edited, reordered, or deleted.
 */
export function createEvent({ source, type, payload, importance } = {}) {
  return createBaseEvent({ source, type, payload, importance });
}

export function appendEvent(evt) {
  if (!_initialized) throw new Error("experience recorder not initialized");

  if (!validateEvent(evt, { events: _cachedEvents })) throw new Error("invalid event");

  const line = JSON.stringify(evt) + "\n";

  // serialize appends
  _queue = _queue.then(async () => {
    await fs.promises.appendFile(_eventsFile, line, "utf8");
    _cachedEvents.push(evt);
  });
  return _queue;
}

export async function recordEvent({ source, type, payload, importance } = {}) {
  const evt = createEvent({ source, type, payload, importance });
  await appendEvent(evt);
  return evt;
}
