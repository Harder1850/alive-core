export type Thought = {
  id: string;
  text: string;
  scores: {
    coherence: number; // [0..1]
    novelty: number; // [0..1]
    contradiction: number; // [0..1] (lower is better)
    total: number; // derived
  };
};

export function scoreThought(args: {
  thoughtText: string;
  question: string;
  stmSnapshot: string[];
  priorThoughts: string[];
}): Thought["scores"] {
  const { thoughtText, question, stmSnapshot, priorThoughts } = args;

  // Deterministic, heuristic scoring only.
  // No model calls, no external services.
  const lower = (s: string) => s.toLowerCase();
  const tokens = (s: string) => lower(s).split(/\W+/).filter(Boolean);

  const qTokens = new Set(tokens(question));
  const tTokens = tokens(thoughtText);
  const overlap = tTokens.filter(t => qTokens.has(t)).length;
  const coherence = Math.max(0, Math.min(1, overlap / Math.max(6, qTokens.size)));

  const allPrior = priorThoughts.join(" ");
  const isNew = allPrior.length === 0 ? 1 : (lower(allPrior).includes(lower(thoughtText)) ? 0 : 1);
  const stmText = stmSnapshot.join(" ");
  const mentionsStm = stmText.length === 0 ? 0 : (lower(stmText).includes(lower(thoughtText)) ? 0 : 1);
  const novelty = Math.max(0, Math.min(1, 0.7 * isNew + 0.3 * mentionsStm));

  // Contradiction heuristic: if thought contains both "should" and "shouldn't" or negations.
  const hasShould = /\bshould\b/i.test(thoughtText);
  const hasShouldNot = /\bshould\s+not\b/i.test(thoughtText) || /\bshouldn['’]t\b/i.test(thoughtText);
  const contradiction = hasShould && hasShouldNot ? 1 : 0.2;

  // Total: coherence + novelty - contradiction (normalized-ish)
  const total = Math.max(0, Math.min(1, 0.55 * coherence + 0.35 * novelty - 0.4 * contradiction));
  return { coherence, novelty, contradiction, total };
}

export function makeThought(args: {
  id: string;
  text: string;
  scores: Thought["scores"];
}): Thought {
  return { id: args.id, text: args.text, scores: args.scores };
}

