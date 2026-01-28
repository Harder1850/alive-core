export type EpistemicMode =
  | "empirical"
  | "normative"
  | "symbolic"
  | "procedural"
  | "social";

export const EPISTEMIC_MODE_PROPERTIES = {
  empirical: {
    confidenceDecay: 0.01,
    contradictionTolerance: "low",
    verificationRequired: true,
  },
  normative: {
    confidenceDecay: 0.005,
    contradictionTolerance: "medium",
    verificationRequired: false,
  },
  symbolic: {
    confidenceDecay: 0.002,
    contradictionTolerance: "high",
    verificationRequired: false,
  },
  procedural: {
    confidenceDecay: 0.02,
    contradictionTolerance: "low",
    verificationRequired: true,
  },
  social: {
    confidenceDecay: 0.01,
    contradictionTolerance: "medium",
    verificationRequired: false,
  },
} as const;