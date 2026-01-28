import { DerivedMemory, ExperienceEvent, MemorySummary } from "../types";

export type WindowMode = "ACTIVE" | "RELAXED" | "IDLE";

export interface StreamEntry {
  id: string;
  timestamp: number;
  source: string;
  type: string;
  importance: number;
  payload: unknown;
  addedAt: number;
}

export interface StreamSummary extends MemorySummary {
  kind: "stream";
  mode: WindowMode;
  maxSize: number;
  totalCount: number;
  inputTypes: Record<string, number>;
  keyTopics: string[];
  collapsedAt?: number;
  timeSpan?: {
    start: number;
    end: number;
  };
}

export interface StreamMemoryState extends DerivedMemory<StreamSummary> {
  entries: StreamEntry[];
}

export interface StreamMemoryOptions {
  activeThreshold?: number;
  activeWindowMs?: number;
  relaxedWindowMs?: number;
  activeMaxSize?: number;
  relaxedMaxSize?: number;
  idleMaxSize?: number;
  idleKeepCount?: number;
  topicMinLength?: number;
  topicLimit?: number;
}

const DEFAULT_OPTIONS: Required<StreamMemoryOptions> = {
  activeThreshold: 5,
  activeWindowMs: 60_000,
  relaxedWindowMs: 300_000,
  activeMaxSize: 20,
  relaxedMaxSize: 100,
  idleMaxSize: 5,
  idleKeepCount: 5,
  topicMinLength: 4,
  topicLimit: 5,
};

export function deriveStreamMemory(
  events: ExperienceEvent[],
  now: number,
  options: StreamMemoryOptions = {}
): StreamMemoryState {
  const cfg = { ...DEFAULT_OPTIONS, ...options };
  const entries: StreamEntry[] = events.map(event => ({
    id: event.id,
    timestamp: event.timestamp,
    source: event.source,
    type: event.type,
    importance: event.importance,
    payload: event.payload,
    addedAt: event.timestamp,
  }));

  const lastActivity = entries.length ? entries[entries.length - 1].addedAt : now;
  const recentCount = entries.filter(
    entry => entry.addedAt >= now - cfg.activeWindowMs
  ).length;

  let mode: WindowMode = "RELAXED";
  let maxSize = cfg.relaxedMaxSize;

  if (recentCount >= cfg.activeThreshold) {
    mode = "ACTIVE";
    maxSize = cfg.activeMaxSize;
  } else if (now - lastActivity > cfg.relaxedWindowMs) {
    mode = "IDLE";
    maxSize = cfg.idleMaxSize;
  }

  let trimmedEntries = entries.slice();
  let summary: StreamSummary = {
    kind: "stream",
    mode,
    maxSize,
    totalCount: entries.length,
    inputTypes: {},
    keyTopics: [],
  };

  if (mode === "IDLE" && trimmedEntries.length) {
    const timeSpan = {
      start: trimmedEntries[0].timestamp,
      end: trimmedEntries[trimmedEntries.length - 1].timestamp,
    };
    summary = {
      ...summary,
      timeSpan,
      collapsedAt: now,
      inputTypes: extractInputTypes(trimmedEntries),
      keyTopics: extractKeyTopics(trimmedEntries, cfg.topicMinLength, cfg.topicLimit),
    };
    trimmedEntries = trimmedEntries.slice(-cfg.idleKeepCount);
  } else if (trimmedEntries.length > maxSize) {
    const removed = trimmedEntries.slice(0, trimmedEntries.length - maxSize);
    trimmedEntries = trimmedEntries.slice(-maxSize);
    summary = {
      ...summary,
      inputTypes: mergeCounts(summary.inputTypes, extractInputTypes(removed)),
      keyTopics: extractKeyTopics(trimmedEntries, cfg.topicMinLength, cfg.topicLimit),
    };
  } else {
    summary = {
      ...summary,
      inputTypes: extractInputTypes(trimmedEntries),
      keyTopics: extractKeyTopics(trimmedEntries, cfg.topicMinLength, cfg.topicLimit),
    };
  }

  const windowStart = trimmedEntries.length ? trimmedEntries[0].timestamp : null;
  const windowEnd = trimmedEntries.length
    ? trimmedEntries[trimmedEntries.length - 1].timestamp
    : null;

  return {
    entries: trimmedEntries,
    summary,
    derivedAt: now,
    window: {
      start: windowStart,
      end: windowEnd,
      count: trimmedEntries.length,
    },
  };
}

function extractInputTypes(entries: StreamEntry[]): Record<string, number> {
  return entries.reduce<Record<string, number>>((acc, entry) => {
    const type = String(entry.type || "unknown");
    acc[type] = (acc[type] ?? 0) + 1;
    return acc;
  }, {});
}

function extractKeyTopics(entries: StreamEntry[], minLength: number, limit: number): string[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (typeof entry.payload === "string") {
      const words = entry.payload.toLowerCase().match(new RegExp(`\\b\\w{${minLength},}\\b`, "g")) || [];
      for (const word of words) {
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function mergeCounts(
  base: Record<string, number>,
  delta: Record<string, number>
): Record<string, number> {
  const merged = { ...base };
  for (const [key, value] of Object.entries(delta)) {
    merged[key] = (merged[key] ?? 0) + value;
  }
  return merged;
}