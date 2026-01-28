import { ConfidenceScore } from "../types";

export interface RecallItem {
  id: string;
  content: unknown;
  confidence: ConfidenceScore;
  lastReinforcedAt: number;
  provenance: string[];
  conflictsWith?: string[];
}

export interface RankedRecall {
  id: string;
  content: unknown;
  score: number;
  confidence: number;
  uncertainty: number;
  conflicts: string[];
  provenance: string[];
}

export interface RecallRankingOptions {
  now: number;
  maxResults?: number;
  weights?: {
    confidence: number;
    recency: number;
  };
}

const DEFAULT_WEIGHTS = {
  confidence: 0.7,
  recency: 0.3,
};

export function rankRecall(
  items: RecallItem[],
  options: RecallRankingOptions
): RankedRecall[] {
  const now = options.now;
  const maxResults = options.maxResults ?? 10;
  const weights = { ...DEFAULT_WEIGHTS, ...options.weights };

  const ranked = items.map(item => {
    const recencyScore = recency(item.lastReinforcedAt, now);
    const confidenceScore = clamp01(item.confidence.value);

    const score =
      weights.confidence * confidenceScore +
      weights.recency * recencyScore;

    return {
      id: item.id,
      content: item.content,
      score: clamp01(score),
      confidence: confidenceScore,
      uncertainty: clamp01(1 - confidenceScore),
      conflicts: item.conflictsWith ?? [],
      provenance: item.provenance,
    };
  });

  ranked.sort((a, b) => b.score - a.score);

  return ranked.slice(0, maxResults);
}

function recency(lastAt: number, now: number): number {
  if (lastAt <= 0 || lastAt > now) return 0;

  const ageMs = now - lastAt;
  const halfLifeMs = 24 * 60 * 60 * 1000;
  return clamp01(Math.exp(-ageMs / halfLifeMs));
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}