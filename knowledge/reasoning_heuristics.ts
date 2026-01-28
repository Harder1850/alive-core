export const REASONING_HEURISTICS = {
  preferSimplerExplanations: true,
  avoidOverfittingSparseData: true,
  treatCorrelationWithCaution: true,
  expectEdgeCaseFailures: true,
  discountMotivatedSources: true,
  separateIntentFromOutcome: true,
  assumeModelsBreakAtScale: true,
} as const;