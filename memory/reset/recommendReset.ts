import { ConfidenceScore } from "../types";

export type ResetLevel = "none" | "soft" | "hard";

export type ResetReason =
  | "persistent_contradictions"
  | "assumption_churn"
  | "confidence_collapse"
  | "memory_stagnation"
  | "long_term_pollution";

export interface ResetEvidence {
  reason: ResetReason;
  score: number;
  details: Record<string, unknown>;
}

export interface ResetRecommendation {
  level: ResetLevel;
  confidence: number;
  reasons: ResetReason[];
  evidence: ResetEvidence[];
}

export interface ResetInputs {
  now: number;
  working: {
    contradictionCount: number;
    contradictionRate: number;
    assumptionCount: number;
    assumptionTurnoverRate: number;
    meanConfidence: ConfidenceScore;
  };
  stream: {
    eventRate: number;
    lastChangeAt: number;
  };
  longTerm: {
    itemCount: number;
    weakItemRatio: number;
    conflictRatio: number;
    meanConfidence: ConfidenceScore;
  };
  thresholds?: Partial<ResetThresholds>;
}

export interface ResetThresholds {
  persistentContradictions: {
    minCount: number;
    minRate: number;
  };
  assumptionChurn: {
    minTurnoverRate: number;
  };
  confidenceCollapse: {
    maxMeanConfidence: number;
  };
  memoryStagnation: {
    minEventRate: number;
    maxIdleMs: number;
  };
  longTermPollution: {
    maxWeakRatio: number;
    maxConflictRatio: number;
  };
}

const DEFAULT_THRESHOLDS: ResetThresholds = {
  persistentContradictions: {
    minCount: 3,
    minRate: 0.05,
  },
  assumptionChurn: {
    minTurnoverRate: 0.2,
  },
  confidenceCollapse: {
    maxMeanConfidence: 0.35,
  },
  memoryStagnation: {
    minEventRate: 0.1,
    maxIdleMs: 5 * 60 * 1000,
  },
  longTermPollution: {
    maxWeakRatio: 0.4,
    maxConflictRatio: 0.25,
  },
};

export function recommendReset(input: ResetInputs): ResetRecommendation {
  const t = { ...DEFAULT_THRESHOLDS, ...input.thresholds };

  const evidence: ResetEvidence[] = [];

  {
    const score = clamp01(
      Math.min(
        input.working.contradictionCount / t.persistentContradictions.minCount,
        input.working.contradictionRate / t.persistentContradictions.minRate
      )
    );

    if (
      input.working.contradictionCount >= t.persistentContradictions.minCount &&
      input.working.contradictionRate >= t.persistentContradictions.minRate
    ) {
      evidence.push({
        reason: "persistent_contradictions",
        score,
        details: {
          contradictionCount: input.working.contradictionCount,
          contradictionRate: input.working.contradictionRate,
        },
      });
    }
  }

  {
    const score = clamp01(
      input.working.assumptionTurnoverRate / t.assumptionChurn.minTurnoverRate
    );

    if (input.working.assumptionTurnoverRate >= t.assumptionChurn.minTurnoverRate) {
      evidence.push({
        reason: "assumption_churn",
        score,
        details: {
          assumptionTurnoverRate: input.working.assumptionTurnoverRate,
        },
      });
    }
  }

  {
    const score = clamp01(
      (t.confidenceCollapse.maxMeanConfidence - input.working.meanConfidence) /
        t.confidenceCollapse.maxMeanConfidence
    );

    if (input.working.meanConfidence <= t.confidenceCollapse.maxMeanConfidence) {
      evidence.push({
        reason: "confidence_collapse",
        score,
        details: {
          meanConfidence: input.working.meanConfidence,
        },
      });
    }
  }

  {
    const idleMs = input.now - input.stream.lastChangeAt;
    const score = clamp01(
      Math.max(
        input.stream.eventRate / t.memoryStagnation.minEventRate,
        idleMs / t.memoryStagnation.maxIdleMs
      )
    );

    if (
      input.stream.eventRate >= t.memoryStagnation.minEventRate &&
      idleMs >= t.memoryStagnation.maxIdleMs
    ) {
      evidence.push({
        reason: "memory_stagnation",
        score,
        details: {
          eventRate: input.stream.eventRate,
          idleMs,
        },
      });
    }
  }

  {
    const score = clamp01(
      Math.max(
        input.longTerm.weakItemRatio / t.longTermPollution.maxWeakRatio,
        input.longTerm.conflictRatio / t.longTermPollution.maxConflictRatio
      )
    );

    if (
      input.longTerm.weakItemRatio >= t.longTermPollution.maxWeakRatio ||
      input.longTerm.conflictRatio >= t.longTermPollution.maxConflictRatio
    ) {
      evidence.push({
        reason: "long_term_pollution",
        score,
        details: {
          weakItemRatio: input.longTerm.weakItemRatio,
          conflictRatio: input.longTerm.conflictRatio,
        },
      });
    }
  }

  if (evidence.length === 0) {
    return {
      level: "none",
      confidence: 0,
      reasons: [],
      evidence: [],
    };
  }

  const confidence = clamp01(average(evidence.map(item => item.score)));
  const level = chooseLevel(evidence);

  return {
    level,
    confidence,
    reasons: evidence.map(item => item.reason),
    evidence,
  };
}

function chooseLevel(evidence: ResetEvidence[]): ResetLevel {
  const hardSignals = new Set<ResetReason>([
    "confidence_collapse",
    "long_term_pollution",
  ]);

  if (evidence.some(item => hardSignals.has(item.reason) && item.score >= 0.8)) {
    return "hard";
  }

  return "soft";
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, val) => acc + val, 0) / values.length;
}