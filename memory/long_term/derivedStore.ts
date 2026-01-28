import { ConfidenceScore, DerivedMemory, ExperienceEvent, MemorySummary } from "../types";

export interface LongTermEntry {
  id: string;
  label: string;
  provenance: string[];
  confidence: ConfidenceScore;
  firstSeen: number;
  lastSeen: number;
  accessCount: number;
  protected?: boolean;
}

export interface LongTermSummary extends MemorySummary {
  kind: "long_term";
  totalItems: number;
  promoted: number;
  demoted: number;
}

export interface LongTermState extends DerivedMemory<LongTermSummary> {
  entries: LongTermEntry[];
}

export interface LongTermOptions {
  promotionThreshold?: number;
  promotionWindowMs?: number;
  demotionAgeMs?: number;
  maxEntries?: number;
}

const DEFAULT_OPTIONS: Required<LongTermOptions> = {
  promotionThreshold: 3,
  promotionWindowMs: 30 * 24 * 60 * 60 * 1000,
  demotionAgeMs: 90 * 24 * 60 * 60 * 1000,
  maxEntries: 200,
};

export function deriveLongTermStore(
  events: ExperienceEvent[],
  now: number,
  options: LongTermOptions = {}
): LongTermState {
  const cfg = { ...DEFAULT_OPTIONS, ...options };
  const observations = extractObservations(events);
  const entries = promoteEntries(observations, cfg, now);
  const { kept, demoted } = demoteEntries(entries, cfg, now);
  const bounded = capEntries(kept, cfg.maxEntries);

  return {
    entries: bounded,
    summary: {
      kind: "long_term",
      totalItems: bounded.length,
      promoted: entries.length,
      demoted,
    },
    derivedAt: now,
    window: {
      start: events.length ? events[0].timestamp : null,
      end: events.length ? events[events.length - 1].timestamp : null,
      count: events.length,
    },
  };
}

interface Observation {
  label: string;
  timestamp: number;
  provenance: string;
  confidence: ConfidenceScore;
  protected?: boolean;
}

function extractObservations(events: ExperienceEvent[]): Observation[] {
  const observations: Observation[] = [];
  for (const event of events) {
    if (event.type === "learning" && typeof event.payload === "object" && event.payload) {
      const payload = event.payload as { label?: unknown; confidence?: unknown; protected?: unknown };
      if (typeof payload.label === "string") {
        observations.push({
          label: payload.label,
          timestamp: event.timestamp,
          provenance: event.id,
          confidence: normalizeConfidence(payload.confidence),
          protected: payload.protected === true,
        });
      }
    }
  }
  return observations;
}

function promoteEntries(
  observations: Observation[],
  cfg: Required<LongTermOptions>,
  now: number
): LongTermEntry[] {
  const grouped = new Map<string, Observation[]>();
  for (const obs of observations) {
    if (!grouped.has(obs.label)) {
      grouped.set(obs.label, []);
    }
    grouped.get(obs.label)?.push(obs);
  }

  const entries: LongTermEntry[] = [];
  const windowStart = now - cfg.promotionWindowMs;

  for (const [label, list] of grouped.entries()) {
    const recent = list.filter(item => item.timestamp >= windowStart);
    if (recent.length >= cfg.promotionThreshold) {
      const firstSeen = Math.min(...list.map(item => item.timestamp));
      const lastSeen = Math.max(...list.map(item => item.timestamp));
      const confidenceValue = averageConfidence(list.map(item => item.confidence));
      entries.push({
        id: `lt_${label.replace(/\s+/g, "_")}`,
        label,
        provenance: list.map(item => item.provenance),
        confidence: confidenceValue,
        firstSeen,
        lastSeen,
        accessCount: list.length,
        protected: list.some(item => item.protected),
      });
    }
  }

  return entries;
}

function demoteEntries(
  entries: LongTermEntry[],
  cfg: Required<LongTermOptions>,
  now: number
): { kept: LongTermEntry[]; demoted: number } {
  const kept: LongTermEntry[] = [];
  let demoted = 0;
  for (const entry of entries) {
    if (entry.protected) {
      kept.push(entry);
      continue;
    }
    if (now - entry.lastSeen > cfg.demotionAgeMs) {
      demoted += 1;
      continue;
    }
    kept.push(entry);
  }
  return { kept, demoted };
}

function capEntries(entries: LongTermEntry[], maxEntries: number): LongTermEntry[] {
  if (entries.length <= maxEntries) return entries;
  return [...entries]
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, maxEntries);
}

function normalizeConfidence(value: unknown): ConfidenceScore {
  if (typeof value === "number") {
    return { value: clamp(value, 0, 1) };
  }
  if (typeof value === "object" && value && "value" in value) {
    const maybe = value as { value: unknown; rationale?: unknown };
    if (typeof maybe.value === "number") {
      return {
        value: clamp(maybe.value, 0, 1),
        rationale: typeof maybe.rationale === "string" ? maybe.rationale : undefined,
      };
    }
  }
  return { value: 0.8 };
}

function averageConfidence(values: ConfidenceScore[]): ConfidenceScore {
  if (!values.length) return { value: 0.8 };
  const sum = values.reduce((acc, score) => acc + score.value, 0);
  return { value: clamp(sum / values.length, 0, 1) };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}