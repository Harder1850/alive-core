// capabilities/registry.js
// Passive capability registry (file-based, query-only).

import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve("data");
const REGISTRY_FILE = path.join(DATA_DIR, "registry.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(REGISTRY_FILE)) fs.writeFileSync(REGISTRY_FILE, "[]", "utf8");
}

function atomicWriteJson(filePath, value) {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(value, null, 2), "utf8");
  fs.renameSync(tmpPath, filePath);
}

function loadAll() {
  ensureStore();
  const raw = fs.readFileSync(REGISTRY_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(list) {
  ensureStore();
  atomicWriteJson(REGISTRY_FILE, list);
}

function now() {
  return Date.now();
}

function normalizeCapability(input) {
  const ts = now();

  return {
    id: input.id,
    name: input.name,
    description: input.description,
    type: input.type,
    interface: input.interface,
    availability: input.availability ?? "unknown",
    constraints: input.constraints,
    tags: input.tags,
    metadata: input.metadata,
    registered_at: input.registered_at ?? ts,
    last_updated: input.last_updated ?? ts,
  };
}

function matchesFilter(cap, filter) {
  if (!filter) return true;

  if (filter.type && cap.type !== filter.type) return false;
  if (filter.availability && cap.availability !== filter.availability) return false;

  if (filter.tag) {
    const tags = Array.isArray(cap.tags) ? cap.tags : [];
    if (!tags.includes(filter.tag)) return false;
  }

  if (filter.tagsAny && filter.tagsAny.length > 0) {
    const tags = Array.isArray(cap.tags) ? cap.tags : [];
    const ok = filter.tagsAny.some(t => tags.includes(t));
    if (!ok) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// PUBLIC API (query-only; no loops, no agentic behavior)
// ---------------------------------------------------------------------------

/**
 * registerCapability(input)
 *
 * Capability: {
 *   id,
 *   name,
 *   description?,
 *   type: 'hardware' | 'software' | 'service',
 *   interface: {
 *     protocol,
 *     endpoint?,
 *     method?,
 *     parameters?,
 *     returns?
 *   },
 *   availability: 'available' | 'unavailable' | 'degraded' | 'unknown',
 *   constraints?: {
 *     requires_network,
 *     rate_limit,
 *     timeout_ms,
 *     dependencies
 *   },
 *   tags?,
 *   metadata?,
 *   registered_at,
 *   last_updated
 * }
 */
export function registerCapability(input) {
  if (!input || typeof input !== "object") throw new Error("invalid capability input");
  if (!input.id || !input.name || !input.type || !input.interface) {
    throw new Error("capability requires id, name, type, interface");
  }

  const list = loadAll();
  if (list.some(c => c.id === input.id)) {
    throw new Error(`capability already exists: ${input.id}`);
  }

  const cap = normalizeCapability(input);
  list.push(cap);
  saveAll(list);
  return cap;
}

export function unregisterCapability(id) {
  const list = loadAll();
  const next = list.filter(c => c.id !== id);
  const changed = next.length !== list.length;
  if (changed) saveAll(next);
  return changed;
}

export function updateCapability(id, update) {
  const list = loadAll();
  const idx = list.findIndex(c => c.id === id);
  if (idx === -1) throw new Error(`capability not found: ${id}`);

  const updated = {
    ...list[idx],
    ...update,
    id: list[idx].id,
    last_updated: now(),
  };

  list[idx] = updated;
  saveAll(list);
  return updated;
}

export function setAvailability(id, status) {
  return updateCapability(id, { availability: status });
}

export function getCapabilityById(id) {
  return loadAll().find(c => c.id === id) || null;
}

export function listCapabilities(filter) {
  return loadAll().filter(c => matchesFilter(c, filter));
}

export function listByType(type) {
  return listCapabilities({ type });
}

export function listAvailable() {
  return listCapabilities({ availability: "available" });
}

export function listByTag(tag) {
  return listCapabilities({ tag });
}

export function hasCapability(id) {
  return !!getCapabilityById(id);
}

export function isAvailable(id) {
  const c = getCapabilityById(id);
  return !!c && c.availability === "available";
}

// ---------------------------------------------------------------------------
// BOOTSTRAP: register built-in capability stubs (idempotent)
// ---------------------------------------------------------------------------

function tryRegisterBuiltin(capability) {
  try {
    if (!hasCapability(capability.id)) {
      registerCapability(capability);
    }
  } catch {
    // best-effort; registry may be read-only
  }
}

tryRegisterBuiltin({
  id: "voice.listen",
  name: "Voice Listen",
  type: "hardware",
  interface: { protocol: "microphone", method: "listenOnce" },
  availability: "available",
});

// Phase 15: gated, one-shot voice input path
// These are intentionally narrower than stdin (no loops, no retries).
tryRegisterBuiltin({
  id: "voice.mic.captureOnce",
  name: "Voice Mic Capture Once",
  type: "hardware",
  interface: { protocol: "microphone", method: "captureOnce" },
  availability: "unknown",
});

tryRegisterBuiltin({
  id: "voice.stt.transcribeOnce",
  name: "Voice STT Transcribe Once",
  type: "software",
  interface: { protocol: "local-stt", method: "transcribeOnce" },
  availability: "unknown",
});

tryRegisterBuiltin({
  id: "voice.speak",
  name: "Voice Speak",
  type: "hardware",
  interface: { protocol: "local-tts", method: "speakText" },
  availability: "available",
});

export function getCountsByType() {
  const list = loadAll();
  const out = { hardware: 0, software: 0, service: 0 };
  for (const c of list) {
    if (c.type === "hardware") out.hardware++;
    else if (c.type === "software") out.software++;
    else if (c.type === "service") out.service++;
  }
  return out;
}

export function getCountsByAvailability() {
  const list = loadAll();
  const out = { available: 0, unavailable: 0, degraded: 0, unknown: 0 };
  for (const c of list) {
    if (c.availability === "available") out.available++;
    else if (c.availability === "unavailable") out.unavailable++;
    else if (c.availability === "degraded") out.degraded++;
    else out.unknown++;
  }
  return out;
}

export { REGISTRY_FILE };
