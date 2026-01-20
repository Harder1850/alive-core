import { DEFAULT_TERMINATION, initTerminationState, shouldTerminate, type TerminationConfig, type TerminationReason } from "./termination.ts";
import { makeThought, scoreThought, type Thought } from "./thought.ts";
import { reflect, type PatternCandidate } from "./reflection.ts";

export type Specialist = {
  id: string;
  advise: (args: { question: string; trigger: string; stmSnapshot: string[] }) => string[];
};

export type IDLConfig = {
  termination?: Partial<TerminationConfig>;
  maxThoughtsPerIteration?: number;
  maxTraceEntries?: number;
  maxPatternCandidates?: number;
};

export type IDLContext = {
  trigger: string;
  stmSnapshot: string[]; // read-only snapshot passed in by caller
  specialists?: Specialist[]; // pure, read-only advisors
};

export type STMReader = {
  // Read-only STM access point. MUST be pure and MUST NOT do I/O.
  // Prefer the caller to pass snapshots, but this exists to support real STM wiring later.
  readSnapshot: (args?: { limit?: number }) => string[];
};

export type IDLTraceEntry = {
  iteration: number;
  depth: number;
  question: string;
  bestScore: number;
  notes: string[];
};

export type IDLResult = {
  terminated: true;
  reason: TerminationReason;
  iterations: number;
  finalAnswer: string | null;
  trace: IDLTraceEntry[];
  patternCandidates: PatternCandidate[];
};

function mergeTermination(overrides?: Partial<TerminationConfig>): TerminationConfig {
  return { ...DEFAULT_TERMINATION, ...(overrides || {}) };
}

export function runIDL(args: { context: IDLContext; config?: IDLConfig; stm?: STMReader }): IDLResult {
  const { context, config } = args;
  const termConfig = mergeTermination(config?.termination);
  const maxThoughtsPerIteration = config?.maxThoughtsPerIteration ?? 5;
  const maxTraceEntries = config?.maxTraceEntries ?? 20;
  const maxPatternCandidates = config?.maxPatternCandidates ?? 5;

  const specialists = Array.isArray(context.specialists) ? context.specialists : [];
  const stmFromReader = args.stm ? args.stm.readSnapshot({ limit: 10 }) : null;
  const stmSnapshot = Array.isArray(stmFromReader)
    ? stmFromReader.slice(0, 10)
    : (Array.isArray(context.stmSnapshot) ? context.stmSnapshot.slice(0, 10) : []);

  let question = initialQuestion(context.trigger);
  let finalAnswer: string | null = null;

  const trace: IDLTraceEntry[] = [];
  const patternCandidates: PatternCandidate[] = [];

  const terminationState = initTerminationState();
  const priorThoughtTexts: string[] = [];

  while (true) {
    // Hard bound: prevent trace/memory growth regardless of caller config.
    if (trace.length >= maxTraceEntries) {
      return {
        terminated: true,
        reason: "max_iterations",
        iterations: terminationState.iterations,
        finalAnswer,
        trace,
        patternCandidates,
      };
    }

    const specialistAdvice = specialists.flatMap(s => {
      try {
        return s.advise({ question, trigger: context.trigger, stmSnapshot });
      } catch {
        return [];
      }
    });

    const thoughtTexts = generateCandidateThoughts({
      trigger: context.trigger,
      question,
      stmSnapshot,
      specialistAdvice,
      max: maxThoughtsPerIteration,
    });

    const thoughts: Thought[] = thoughtTexts.map((text, idx) => {
      const scores = scoreThought({
        thoughtText: text,
        question,
        stmSnapshot,
        priorThoughts: priorThoughtTexts,
      });
      return makeThought({ id: `t${terminationState.iterations}_${idx}`, text, scores });
    });

    const best = [...thoughts].sort((a, b) => b.scores.total - a.scores.total)[0] || null;
    const bestScore = best?.scores.total ?? 0;
    const bestContradiction = best?.scores.contradiction ?? 1;

    const r = reflect({
      trigger: context.trigger,
      question,
      thoughts,
      stmSnapshot,
      depth: terminationState.depth,
    });

    if (r.shouldProposePattern && r.patternCandidate && patternCandidates.length < maxPatternCandidates) {
      patternCandidates.push(r.patternCandidate);
    }

    if (best) {
      priorThoughtTexts.push(best.text);
      finalAnswer = best.text;
    }

    trace.push({
      iteration: terminationState.iterations,
      depth: terminationState.depth,
      question,
      bestScore,
      notes: r.revisionNotes,
    });

    terminationState.iterations++;
    terminationState.lastBestScore = Math.max(terminationState.lastBestScore, bestScore);

    const hasNextQuestion = typeof r.nextQuestion === "string" && r.nextQuestion.length > 0;
    const t = shouldTerminate({
      config: termConfig,
      state: terminationState,
      bestScore,
      bestContradiction,
      hasNextQuestion,
    });
    if (t.terminate) {
      return {
        terminated: true,
        reason: t.reason,
        iterations: terminationState.iterations,
        finalAnswer,
        trace,
        patternCandidates,
      };
    }

    // Continue loop with next internal question.
    question = r.nextQuestion!;
    terminationState.depth++;
  }
}

function initialQuestion(trigger: string): string {
  const t = (trigger || "").trim();
  if (!t) return "What needs to be resolved internally?";
  return `What is the best internal interpretation of: ${t}?`;
}

function generateCandidateThoughts(args: {
  trigger: string;
  question: string;
  stmSnapshot: string[];
  specialistAdvice: string[];
  max: number;
}): string[] {
  const { trigger, question, stmSnapshot, specialistAdvice, max } = args;

  const thoughts: string[] = [];

  // Seed with specialist advice first.
  for (const a of specialistAdvice) {
    if (thoughts.length >= max) break;
    if (typeof a === "string" && a.trim()) thoughts.push(a.trim());
  }

  // Then lightweight deterministic “compositions”.
  const stm = stmSnapshot.slice(0, 3).join(" | ");
  if (thoughts.length < max) thoughts.push(`Given "${trigger}", answer "${question}" using STM: ${stm}`);
  if (thoughts.length < max) thoughts.push(`Conservative interpretation: focus only on what is supported by trigger+STM.`);
  if (thoughts.length < max) thoughts.push(`If contradictions exist, prioritize the least-contradictory explanation.`);
  if (thoughts.length < max) thoughts.push(`Propose a compressed pattern, not raw speculation.`);

  return thoughts.slice(0, max);
}
