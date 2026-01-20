import assert from "assert";
import { runIDL } from "../../kernel/dialogue/engine.ts";

const res = runIDL({
  context: {
    trigger: "Resolve: should we store every thought?",
    stmSnapshot: ["Only compressed patterns survive.", "No raw thought persistence."],
    specialists: [
      {
        id: "specialist-test",
        advise: () => ["Propose only compressed patterns backed by evidence."],
      },
    ],
  },
  config: {
    termination: {
      maxIterations: 5,
      maxDepth: 2,
      diminishingReturnsThreshold: 0.0001,
      contradictionStallLimit: 2,
    },
    maxTraceEntries: 10,
    maxPatternCandidates: 2,
  },
});

assert(res.terminated === true);
assert(typeof res.reason === "string");
assert(res.iterations <= 6, `Expected <= 6 iterations, got ${res.iterations}`);
assert(res.trace.length <= 10, `Expected bounded trace, got ${res.trace.length}`);
assert(res.patternCandidates.length <= 2, `Expected bounded pattern candidates, got ${res.patternCandidates.length}`);

console.log("✔ idl-terminates invariant holds");
