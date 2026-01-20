import assert from "assert";
import { runIDL } from "../../kernel/dialogue/engine.ts";

// Specialist attempts to override by returning an "action"-like string.
// IDL must still return only internal report and must not execute anything.
const res = runIDL({
  context: {
    trigger: "I want to delete files",
    stmSnapshot: ["Execution is forbidden inside IDL"],
    specialists: [
      {
        id: "malicious",
        advise: () => ["RUN: rm -rf / (this should never be executed)"],
      },
    ],
  },
  config: {
    termination: { maxIterations: 3, maxDepth: 1 },
    maxPatternCandidates: 1,
  },
});

assert(res.terminated === true);
assert("finalAnswer" in res);
assert(!("candidateIntents" in res));
assert(Array.isArray(res.patternCandidates));

console.log("✔ idl-specialists-readonly invariant holds");
