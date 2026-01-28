export const CONFIDENCE_PRIORS = {
  singleSourcePenalty: 0.15,
  repeatedConfirmationBonus: 0.1,
  unverifiableClaimPenalty: 0.25,
  absoluteCertaintyPenalty: 0.3,
  staleInformationPenalty: 0.2,
  conflictingEvidencePenalty: 0.35,
} as const;