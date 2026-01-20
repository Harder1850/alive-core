import type { Thought } from "./thought.ts";

export type PatternCandidate = {
  id: string;
  title: string;
  summary: string;
  evidence: string[]; // short excerpts from STM/trigger supporting it
  confidence: number; // [0..1]
};

export type Reflection = {
  bestThoughtId: string | null;
  revisionNotes: string[];
  shouldProposePattern: boolean;
  patternCandidate?: PatternCandidate;
  nextQuestion: string | null;
};

export function reflect(args: {
  trigger: string;
  question: string;
  thoughts: Thought[];
  stmSnapshot: string[];
  depth: number;
}): Reflection {
  const { trigger, question, thoughts, stmSnapshot, depth } = args;
  const sorted = [...thoughts].sort((a, b) => b.scores.total - a.scores.total);
  const best = sorted[0] || null;

  const revisionNotes: string[] = [];
  if (!best) {
    return { bestThoughtId: null, revisionNotes: ["no thoughts"], shouldProposePattern: false, nextQuestion: null };
  }

  if (best.scores.contradiction >= 0.6) {
    revisionNotes.push("high contradiction detected");
  }
  if (best.scores.coherence < 0.2) {
    revisionNotes.push("low coherence with question");
  }

  const shouldProposePattern = best.scores.total >= 0.7 && best.scores.contradiction < 0.6;

  const patternCandidate: PatternCandidate | undefined = shouldProposePattern
    ? {
        id: `pat_${best.id}`,
        title: `Pattern: ${question.slice(0, 48)}`,
        summary: best.text.slice(0, 280),
        evidence: [trigger, ...stmSnapshot].slice(0, 3),
        confidence: Math.max(0, Math.min(1, best.scores.total)),
      }
    : undefined;

  // Generate another internal question only if we're early and not good enough.
  let nextQuestion: string | null = null;
  if (depth < 3 && best.scores.total < 0.75) {
    nextQuestion = `What is the main uncertainty in: ${question}?`;
  }

  return {
    bestThoughtId: best.id,
    revisionNotes,
    shouldProposePattern,
    patternCandidate,
    nextQuestion,
  };
}
