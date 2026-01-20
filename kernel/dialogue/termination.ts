export type TerminationReason =
  | "max_iterations"
  | "max_depth"
  | "diminishing_returns"
  | "contradiction_stall"
  | "no_further_questions";

export type TerminationConfig = {
  maxIterations: number;
  maxDepth: number;
  diminishingReturnsThreshold: number; // [0..1] improvement threshold
  contradictionStallLimit: number;
};

export const DEFAULT_TERMINATION: TerminationConfig = {
  maxIterations: 12,
  maxDepth: 4,
  diminishingReturnsThreshold: 0.02,
  contradictionStallLimit: 3,
};

export type TerminationState = {
  iterations: number;
  depth: number;
  lastBestScore: number;
  contradictionStallCount: number;
};

export function initTerminationState(): TerminationState {
  return {
    iterations: 0,
    depth: 0,
    lastBestScore: 0,
    contradictionStallCount: 0,
  };
}

export function shouldTerminate(args: {
  config: TerminationConfig;
  state: TerminationState;
  bestScore: number;
  bestContradiction: number;
  hasNextQuestion: boolean;
}): { terminate: true; reason: TerminationReason } | { terminate: false } {
  const { config, state, bestScore, bestContradiction, hasNextQuestion } = args;

  if (state.iterations >= config.maxIterations) {
    return { terminate: true, reason: "max_iterations" };
  }
  if (state.depth >= config.maxDepth) {
    return { terminate: true, reason: "max_depth" };
  }

  const improvement = bestScore - state.lastBestScore;
  if (state.iterations > 0 && improvement >= 0 && improvement < config.diminishingReturnsThreshold) {
    return { terminate: true, reason: "diminishing_returns" };
  }

  // Contradiction stall: if contradiction cannot be driven down across multiple steps.
  // (We treat contradiction as [0..1], smaller is better.)
  // If contradiction remains high and doesn't improve, count stalls.
  if (state.iterations > 0) {
    const high = bestContradiction >= 0.6;
    if (high) {
      state.contradictionStallCount++;
    } else {
      state.contradictionStallCount = 0;
    }
    if (state.contradictionStallCount >= config.contradictionStallLimit) {
      return { terminate: true, reason: "contradiction_stall" };
    }
  }

  if (!hasNextQuestion) {
    return { terminate: true, reason: "no_further_questions" };
  }

  return { terminate: false };
}

