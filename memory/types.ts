export interface ConfidenceScore {
  value: number;
  rationale?: string;
}

export interface MemorySummary {
  kind: string;
}

export interface DerivedMemory<TSummary extends MemorySummary = MemorySummary> {
  summary: TSummary;
  derivedAt: number;
  window: {
    start: number | null;
    end: number | null;
    count: number;
  };
}

export interface ExperienceEvent {
  id: string;
  timestamp: number;
  source: string;
  type: string;
  importance: number;
  payload: unknown;
}