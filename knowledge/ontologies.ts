export type OntologicalCategory =
  | "Agent"
  | "Object"
  | "Event"
  | "Claim"
  | "Belief"
  | "Rule"
  | "Signal"
  | "Risk"
  | "Constraint"
  | "Explanation";

export const ONTOLOGY_RULES = {
  Claim: {
    mayBeTrue: true,
    mayBeFalse: true,
    requiresEvidence: true,
  },
  Belief: {
    mayBeHeldWithoutEvidence: true,
    shouldLowerConfidence: true,
  },
  Rule: {
    mayNotMatchReality: true,
  },
  Signal: {
    mayBeNoisy: true,
  },
  Explanation: {
    mayBeIncomplete: true,
  },
} as const;