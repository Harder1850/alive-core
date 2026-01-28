import { ConfidenceScore, DerivedMemory, ExperienceEvent, MemorySummary } from "../types";
import { StreamSummary } from "../short_term/stream";

export interface AssumptionEntry {
  text: string;
  confidence: ConfidenceScore;
  timestamp: number;
  validated?: boolean;
  validatedAt?: number;
  topic: string;
}

export interface WorkingMemoryStateSummary extends MemorySummary {
  kind: "working";
  assumptions: AssumptionEntry[];
  contradictions: boolean;
  sessionAgeMs: number;
  lastUpdate: number | null;
  decayThresholdMs: number;
}

export interface WorkingMemoryState extends DerivedMemory<WorkingMemoryStateSummary> {
  state: Record<string, unknown>;
}

export interface WorkingMemoryOptions {
  decayThresholdMs?: number;
  assumptionTopicKeywords?: string[];
}

const DEFAULT_OPTIONS: Required<WorkingMemoryOptions> = {
  decayThresholdMs: 3_600_000,
  assumptionTopicKeywords: ["ingredient", "temperature", "time", "method", "tool"],
};

export function deriveWorkingMemory(
  events: ExperienceEvent[],
  streamSummary: StreamSummary | null,
  now: number,
  options: WorkingMemoryOptions = {}
): WorkingMemoryState {
  const cfg = { ...DEFAULT_OPTIONS, ...options };
  const baseState: Record<string, unknown> = {};
  const assumptions: AssumptionEntry[] = [];
  let lastUpdate: number | null = null;

  for (const event of events) {
    lastUpdate = lastUpdate ? Math.max(lastUpdate, event.timestamp) : event.timestamp;

    if (event.type === "assumption" && typeof event.payload === "object" && event.payload) {
      const payload = event.payload as { text?: unknown; confidence?: unknown; validated?: unknown };
      if (typeof payload.text === "string") {
        assumptions.push({
          text: payload.text,
          confidence: normalizeConfidence(payload.confidence),
          timestamp: event.timestamp,
          validated: typeof payload.validated === "boolean" ? payload.validated : undefined,
          validatedAt: typeof payload.validated === "boolean" ? event.timestamp : undefined,
          topic: extractTopic(payload.text, cfg.assumptionTopicKeywords),
        });
      }
    }

    if (event.type === "state_update" && typeof event.payload === "object" && event.payload) {
      Object.assign(baseState, event.payload as Record<string, unknown>);
    }
  }

  if (streamSummary) {
    baseState.streamMode = streamSummary.mode;
    baseState.streamTopics = streamSummary.keyTopics;
  }

  const filteredAssumptions = assumptions.filter(assumption =>
    now - assumption.timestamp <= cfg.decayThresholdMs
  );

  const contradictions = detectContradictions(filteredAssumptions);

  const windowStart = events.length ? events[0].timestamp : null;
  const windowEnd = events.length ? events[events.length - 1].timestamp : null;

  return {
    state: baseState,
    summary: {
      kind: "working",
      assumptions: filteredAssumptions,
      contradictions,
      sessionAgeMs: windowStart ? now - windowStart : 0,
      lastUpdate,
      decayThresholdMs: cfg.decayThresholdMs,
    },
    derivedAt: now,
    window: {
      start: windowStart,
      end: windowEnd,
      count: events.length,
    },
  };
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function extractTopic(text: string, keywords: string[]): string {
  const lower = text.toLowerCase();
  for (const keyword of keywords) {
    if (lower.includes(keyword)) {
      return keyword;
    }
  }
  return "general";
}

function detectContradictions(assumptions: AssumptionEntry[]): boolean {
  const validated = assumptions.filter(a => typeof a.validated === "boolean");
  if (validated.length < 2) return false;

  const grouped: Record<string, boolean[]> = {};
  for (const assumption of validated) {
    if (!grouped[assumption.topic]) {
      grouped[assumption.topic] = [];
    }
    grouped[assumption.topic].push(Boolean(assumption.validated));
  }

  return Object.values(grouped).some(values => values.includes(true) && values.includes(false));
}