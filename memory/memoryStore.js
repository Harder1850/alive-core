/**
 * memoryStore.js - Passive File-Based Memory Store
 *
 * ============================================================================
 * WHAT THIS MODULE DOES:
 * ============================================================================
 * - Stores memory entries as individual JSON files on disk
 * - Retrieves memories when explicitly queried
 * - Updates existing memories when explicitly requested
 * - Prunes memories based on provided criteria
 * - Survives shutdown and restart (persistent file storage)
 *
 * ============================================================================
 * WHAT THIS MODULE DOES NOT DO:
 * ============================================================================
 * - Does NOT call external APIs
 * - Does NOT run background loops or timers
 * - Does NOT make decisions about importance or priority
 * - Does NOT push data anywhere
 * - Does NOT assign urgency
 * - Does NOT interpret or analyze memory contents
 * - Does NOT initiate any actions
 * - Does NOT block the cognitive spine
 *
 * This is infrastructure only. It is passive and query-based.
 * ============================================================================
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

// NOTE:
// This module intentionally uses synchronous filesystem operations.
// It MUST NOT be called from the cognitive spine or any time-critical path.
// This is infrastructure-only and is safe when used from background or setup code.

// ============================================================================
// TYPES (JSDoc)
// ============================================================================

/** @typedef {'preference' | 'fact' | 'decision' | 'outcome' | 'note'} MemoryType */

/**
 * @typedef {{
 *   id: string,
 *   type: MemoryType,
 *   content: string | Record<string, unknown>,
 *   created_at: number,
 *   last_accessed: number,
 *   access_count: number,
 *   tags: string[],
 *   decay_score: number
 * }} MemoryEntry
 */

/**
 * @typedef {{
 *   type?: MemoryType,
 *   tags?: string[],
 *   tagsAll?: string[],
 *   minDecayScore?: number,
 *   maxDecayScore?: number,
 *   createdAfter?: number,
 *   createdBefore?: number,
 *   accessedAfter?: number,
 *   accessedBefore?: number,
 *   minAccessCount?: number,
 *   maxAccessCount?: number,
 *   contentContains?: string
 * }} MemoryFilter
 */

/**
 * @typedef {{
 *   maxDecayScore?: number,
 *   accessedBefore?: number,
 *   maxAccessCount?: number,
 *   types?: MemoryType[]
 * }} PruneCriteria
 */

/**
 * @typedef {{
 *   totalCount: number,
 *   countByType: Record<MemoryType, number>,
 *   oldestTimestamp: number | null,
 *   newestTimestamp: number | null
 * }} MemorySummaryStub
 */

// ============================================================================
// INTERNAL STATE
// ============================================================================

let storeDir = "";
let indexPath = "";
let initialized = false;

/** @type {Map<string, string>} */
let memoryIndex = new Map();

// ============================================================================
// HELPER FUNCTIONS (PRIVATE)
// ============================================================================

function ensureInitialized() {
  if (!initialized) {
    throw new Error("MemoryStore not initialized. Call initializeStore() first.");
  }
}

function getEntryPath(id) {
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const hash = crypto.createHash("sha1").update(id).digest("hex").slice(0, 8);
  return path.join(storeDir, `${safeId}_${hash}.json`);
}

/** @param {MemoryEntry} entry */
function writeEntry(entry) {
  const entryPath = getEntryPath(entry.id);
  fs.writeFileSync(entryPath, JSON.stringify(entry, null, 2), "utf-8");
  memoryIndex.set(entry.id, entryPath);
  persistIndex();
}

/** @param {string} id */
function readEntry(id) {
  const entryPath = memoryIndex.get(id);
  if (!entryPath || !fs.existsSync(entryPath)) {
    return null;
  }
  try {
    const data = fs.readFileSync(entryPath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/** @param {string} id */
function deleteEntry(id) {
  const entryPath = memoryIndex.get(id);
  if (!entryPath) return false;

  try {
    if (fs.existsSync(entryPath)) {
      fs.unlinkSync(entryPath);
    }
    memoryIndex.delete(id);
    persistIndex();
    return true;
  } catch {
    return false;
  }
}

function persistIndex() {
  const indexData = Object.fromEntries(memoryIndex);
  const tmpPath = `${indexPath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(indexData, null, 2), "utf-8");
  fs.renameSync(tmpPath, indexPath);
}

function loadIndex() {
  if (fs.existsSync(indexPath)) {
    try {
      const data = fs.readFileSync(indexPath, "utf-8");
      const parsed = JSON.parse(data);
      memoryIndex = new Map(Object.entries(parsed));
    } catch {
      memoryIndex = new Map();
    }
  } else {
    memoryIndex = new Map();
  }
}

/** @param {MemoryEntry} entry @param {MemoryFilter} filter */
function matchesFilter(entry, filter) {
  if (filter.type !== undefined && entry.type !== filter.type) return false;

  if (filter.tags !== undefined && filter.tags.length > 0) {
    const hasAny = filter.tags.some(t => entry.tags.includes(t));
    if (!hasAny) return false;
  }

  if (filter.tagsAll !== undefined && filter.tagsAll.length > 0) {
    const hasAll = filter.tagsAll.every(t => entry.tags.includes(t));
    if (!hasAll) return false;
  }

  if (filter.minDecayScore !== undefined && entry.decay_score < filter.minDecayScore) return false;
  if (filter.maxDecayScore !== undefined && entry.decay_score > filter.maxDecayScore) return false;

  if (filter.createdAfter !== undefined && entry.created_at < filter.createdAfter) return false;
  if (filter.createdBefore !== undefined && entry.created_at > filter.createdBefore) return false;

  if (filter.accessedAfter !== undefined && entry.last_accessed < filter.accessedAfter) return false;
  if (filter.accessedBefore !== undefined && entry.last_accessed > filter.accessedBefore) return false;

  if (filter.minAccessCount !== undefined && entry.access_count < filter.minAccessCount) return false;
  if (filter.maxAccessCount !== undefined && entry.access_count > filter.maxAccessCount) return false;

  if (filter.contentContains !== undefined) {
    const contentStr = typeof entry.content === "string" ? entry.content : JSON.stringify(entry.content);
    if (!contentStr.toLowerCase().includes(filter.contentContains.toLowerCase())) return false;
  }

  return true;
}

/** @param {MemoryEntry} entry @param {PruneCriteria} criteria */
function matchesPruneCriteria(entry, criteria) {
  // Pruning uses OR semantics by design.
  // Matching ANY prune criterion is sufficient for removal.
  // This is intentional and must not be changed to AND logic.

  if (criteria.types !== undefined && criteria.types.length > 0) {
    if (!criteria.types.includes(entry.type)) return false;
  }

  if (criteria.maxDecayScore !== undefined && entry.decay_score <= criteria.maxDecayScore) return true;
  if (criteria.accessedBefore !== undefined && entry.last_accessed < criteria.accessedBefore) return true;
  if (criteria.maxAccessCount !== undefined && entry.access_count <= criteria.maxAccessCount) return true;

  return false;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Initialize the memory store.
 * Must be called before any other operations.
 * Safe to call multiple times (idempotent).
 *
 * @param {string} [baseDir] Directory for storing memory files. Defaults to ./memory_data
 */
export function initializeStore(baseDir = "./memory_data") {
  storeDir = path.resolve(baseDir);
  indexPath = path.join(storeDir, "_index.json");

  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
  }

  loadIndex();
  initialized = true;
}

/**
 * Add a new memory entry.
 * Generates timestamps automatically if not provided.
 *
 * @param {Partial<MemoryEntry> & { id: string, type: MemoryType, content: MemoryEntry['content'] }} entry
 * @returns {MemoryEntry}
 */
export function addMemory(entry) {
  ensureInitialized();

  const now = Date.now();

  /** @type {MemoryEntry} */
  const fullEntry = {
    id: entry.id,
    type: entry.type,
    content: entry.content,
    created_at: entry.created_at ?? now,
    last_accessed: entry.last_accessed ?? now,
    access_count: entry.access_count ?? 0,
    tags: entry.tags ?? [],
    decay_score: entry.decay_score ?? 1.0,
  };

  writeEntry(fullEntry);
  return fullEntry;
}

/**
 * Retrieve a memory by ID.
 * Updates last_accessed and access_count.
 *
 * @param {string} id
 * @returns {MemoryEntry | null}
 */
export function getMemoryById(id) {
  ensureInitialized();

  const entry = readEntry(id);
  if (!entry) return null;

  entry.last_accessed = Date.now();
  entry.access_count += 1;
  writeEntry(entry);

  return entry;
}

/**
 * Query memories matching a filter.
 * Does NOT update access metadata for results.
 *
 * @param {MemoryFilter} filter
 * @returns {MemoryEntry[]}
 */
export function queryMemory(filter) {
  ensureInitialized();

  /** @type {MemoryEntry[]} */
  const results = [];

  for (const id of memoryIndex.keys()) {
    const entry = readEntry(id);
    if (entry && matchesFilter(entry, filter)) {
      results.push(entry);
    }
  }

  return results;
}

/**
 * Update an existing memory entry.
 * Only updates provided fields.
 *
 * @param {string} id
 * @param {Partial<Omit<MemoryEntry, 'id'>>} partialUpdate
 * @returns {MemoryEntry | null}
 */
export function updateMemory(id, partialUpdate) {
  ensureInitialized();

  const entry = readEntry(id);
  if (!entry) return null;

  /** @type {MemoryEntry} */
  const updated = {
    ...entry,
    ...partialUpdate,
    id: entry.id,
  };

  writeEntry(updated);
  return updated;
}

/**
 * Remove memories matching criteria.
 *
 * @param {PruneCriteria} criteria
 * @returns {string[]} pruned entry IDs
 */
export function pruneMemory(criteria) {
  ensureInitialized();

  /** @type {string[]} */
  const pruned = [];
  /** @type {string[]} */
  const toPrune = [];

  for (const id of memoryIndex.keys()) {
    const entry = readEntry(id);
    if (entry && matchesPruneCriteria(entry, criteria)) {
      toPrune.push(id);
    }
  }

  for (const id of toPrune) {
    if (deleteEntry(id)) {
      pruned.push(id);
    }
  }

  return pruned;
}

/**
 * Get basic statistics about the memory store.
 * This is a STUB - does NOT perform any AI analysis.
 * Only returns raw counts and timestamps.
 *
 * @returns {MemorySummaryStub}
 */
export function summarizeMemoryStub() {
  ensureInitialized();

  /** @type {Record<MemoryType, number>} */
  const countByType = {
    preference: 0,
    fact: 0,
    decision: 0,
    outcome: 0,
    note: 0,
  };

  let oldest = null;
  let newest = null;
  let total = 0;

  for (const id of memoryIndex.keys()) {
    const entry = readEntry(id);
    if (!entry) continue;

    total++;
    countByType[entry.type]++;

    if (oldest === null || entry.created_at < oldest) {
      oldest = entry.created_at;
    }
    if (newest === null || entry.created_at > newest) {
      newest = entry.created_at;
    }
  }

  return {
    totalCount: total,
    countByType,
    oldestTimestamp: oldest,
    newestTimestamp: newest,
  };
}

/**
 * Get all memory IDs currently in store.
 * Useful for iteration without loading all entries.
 *
 * @returns {string[]}
 */
export function getAllIds() {
  ensureInitialized();
  return Array.from(memoryIndex.keys());
}

/**
 * Check if a memory exists by ID.
 * Does NOT update access metadata.
 *
 * @param {string} id
 * @returns {boolean}
 */
export function hasMemory(id) {
  ensureInitialized();
  return memoryIndex.has(id);
}

/**
 * Delete a specific memory by ID.
 *
 * @param {string} id
 * @returns {boolean}
 */
export function deleteMemory(id) {
  ensureInitialized();
  return deleteEntry(id);
}

/**
 * Clear all memories from the store.
 * USE WITH CAUTION.
 *
 * @returns {number} Number of entries deleted
 */
export function clearAll() {
  ensureInitialized();

  const ids = getAllIds();
  let count = 0;

  for (const id of ids) {
    if (deleteEntry(id)) {
      count++;
    }
  }

  return count;
}

