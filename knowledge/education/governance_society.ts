export const governanceSocietyStack = {
  title: "ALIVE Governance, Society & Human Systems Stack — Unified v1",
  purpose:
    "Provide ALIVE with a practical, reality-grounded understanding of how humans organize power, rules, meaning, territory, and collective action.",
  guidingQuestion:
    "Who has power? Why? Over whom? Under what rules? And what happens if those rules are ignored?",
  globalPrinciples: [
    "Authority precedes action. Power without legitimacy creates risk.",
    "Process matters as much as outcomes.",
    "Jurisdiction defines reality. Outside it, nothing applies.",
    "History constrains the present. Institutions remember.",
    "Geography shapes behavior. Borders, resources, and distance matter.",
  ],
  government: {
    coreConcepts: ["Authority vs power vs legitimacy.", "Sovereignty.", "Jurisdiction.", "Consent (explicit, implicit, coerced).", "Accountability."],
    forms: [
      "Tribal governments.",
      "City / municipal governments.",
      "County / regional authorities.",
      "State / provincial governments.",
      "Federal / national governments.",
      "Supranational bodies.",
    ],
    branches: ["Executive (administration).", "Legislative (rule-making).", "Judicial (interpretation)."],
    invariant: "Governments act through institutions, not abstractions.",
  },
  law: {
    definition: ["Codified expectations.", "Enforceable norms.", "Risk boundaries."],
    types: [
      "Constitutional / foundational.",
      "Statutory.",
      "Regulatory.",
      "Administrative.",
      "Common law / precedent.",
      "Customary / traditional law.",
    ],
    realityChecks: ["Law is local.", "Enforcement is uneven.", "Process can matter more than truth.", "Timing changes outcomes."],
    rule: "If you ignore law, model enforcement risk.",
  },
  politicalSystems: {
    types: ["Democracies.", "Republics.", "Monarchies.", "Authoritarian systems.", "Hybrid systems."],
    focus: ["Incentives.", "Stability vs speed.", "Failure modes."],
  },
  economics: {
    coreConcepts: ["Scarcity.", "Supply & demand.", "Markets vs planning.", "Externalities.", "Public goods.", "Incentives."],
    appliedUnderstanding: ["Why systems drift.", "Why inequality forms.", "Why corruption appears."],
  },
  history: {
    uses: ["Pattern recognition.", "Institutional inertia.", "Long-term consequences."],
    frames: [
      "Rise and fall of states.",
      "Colonialism & extraction.",
      "Industrialization.",
      "Wars and state formation.",
      "Technological disruption.",
    ],
    rule: "History doesn’t repeat, but incentives rhyme.",
  },
  philosophy: {
    epistemology: ["What can be known.", "Uncertainty.", "Evidence vs belief."],
    ethics: ["Harm minimization.", "Duty vs outcome.", "Responsibility."],
    politicalPhilosophy: ["Authority.", "Rights.", "Justice."],
    invariant: "Philosophy frames choices when facts run out.",
  },
  geography: {
    physical: ["Continents.", "Oceans.", "Rivers.", "Mountains.", "Climate zones."],
    human: ["Borders.", "Trade routes.", "Cities.", "Resource locations."],
    rule: "Geography limits policy before ideology does.",
  },
  citiesAndSettlements: {
    whyCitiesExist: ["Trade.", "Defense.", "Labor concentration.", "Infrastructure efficiency."],
    citySystems: ["Transportation.", "Water.", "Power.", "Waste.", "Housing.", "Governance."],
    failureModes: ["Congestion.", "Inequality.", "Infrastructure decay.", "Resource stress."],
  },
  institutionsAndEntities: {
    types: ["Governments.", "Corporations.", "Nonprofits.", "Tribes.", "International organizations."],
    behavior: ["Self-preservation.", "Risk avoidance.", "Mission drift."],
  },
  cultureAndSocialNorms: {
    concepts: ["Formal rules vs informal rules.", "Trust.", "Reputation.", "Ritual.", "Language."],
    invariant: "Culture enforces what law cannot.",
  },
  referenceOnly: [
    "Specific statutes.",
    "Case law.",
    "Treaties.",
    "Maps with precision borders.",
    "Census data.",
  ],
  storageModel: {
    coreIntuitionText: "~40–70 MB",
    embeddingsAssociations: "~60–100 MB",
    referenceIndex: "~5–15 MB",
    externalContent: "Fetched on demand",
    totalLocalFootprint: "~120–180 MB",
  },
  outputStyle: [
    "Identify jurisdiction first.",
    "Name authority explicitly.",
    "Flag legal or political risk.",
    "Distinguish facts from norms.",
  ],
  endState:
    "ALIVE understands how humans organize power, space, meaning, and rules and can reason about authority, legitimacy, incentives, and geography without ideology.",
} as const;