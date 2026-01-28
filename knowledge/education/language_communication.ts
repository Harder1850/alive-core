export const languageCommunicationStack = {
  title: "ALIVE Language & Communication Stack — Unified v1",
  purpose:
    "Give ALIVE a practical, operational command of language as a tool for thinking, coordination, persuasion, documentation, and risk reduction.",
  guidingQuestion: "How does language enable thinking, coordination, and precision under pressure?",
  globalPrinciples: [
    "Language compresses reality. Precision reduces error; ambiguity increases risk.",
    "Meaning ≠ words alone. Context, intent, and audience matter.",
    "Structure carries meaning. Form shapes interpretation.",
    "Miscommunication is the default failure mode.",
    "Clarity beats elegance under pressure.",
  ],
  coreEnglishCompetence: {
    vocabularyTarget: "~8,000–12,000 high-utility words",
    focusAreas: [
      "Common verbs (act, decide, change, manage, assess).",
      "Quantitative language (increase, decrease, rate, range).",
      "Time & causality (before, after, during, leads to).",
      "Risk & uncertainty (likely, possible, catastrophic).",
      "Legal & governance terms (authority, jurisdiction, liability).",
      "Scientific connectors (process, system, feedback).",
    ],
    rule: "Prefer plain language unless technical precision is required.",
  },
  languageStructure: {
    phoneticsAndSound: ["Phonemes.", "Stress & emphasis.", "Homophones and ambiguity."],
    morphology: ["Roots, prefixes, suffixes.", "Word families (decide, decision, decisive)."],
    syntax: ["Subject–verb–object.", "Modifiers.", "Active vs passive voice."],
    semantics: ["Literal vs implied meaning.", "Polysemy (multiple meanings).", "Technical vs everyday usage."],
    pragmatics: ["Audience awareness.", "Formal vs informal.", "Cultural expectations."],
  },
  sentenceAndParagraphLogic: {
    sentences: ["Declarative.", "Interrogative.", "Imperative.", "Conditional."],
    paragraphs: ["Topic sentence.", "Supporting statements.", "Conclusion or transition."],
    invariant: "One main idea per paragraph.",
  },
  documentTypesAndStructure: {
    shortForms: ["Notes.", "Emails.", "Memos.", "Instructions."],
    mediumForms: ["Essays.", "Reports.", "Proposals.", "Policies."],
    longForms: ["Articles.", "White papers.", "Manuals.", "Books."],
    structuralUnits: ["Title.", "Abstract / summary.", "Sections.", "Subsections.", "Chapters.", "Appendices."],
    rule: "Structure signals intent before content is read.",
  },
  argumentationAndReasoning: {
    elements: ["Claims.", "Evidence.", "Assumptions.", "Counterarguments.", "Conclusions."],
    commonFailures: ["Ambiguity.", "Overgeneralization.", "Hidden assumptions."],
  },
  persuasionAndCommunication: {
    tools: ["Framing.", "Emphasis.", "Tone.", "Narrative.", "Authority signals."],
    invariant: "Persuasion without deception.",
  },
  contractsLawPrecision: {
    elements: ["Defined terms.", "Shall vs may vs must.", "Conditions and triggers.", "Exceptions.", "Scope and limits."],
    rule: "If language can be interpreted two ways, it will be.",
  },
  ambiguityAndErrorManagement: ["Identify vague terms.", "Ask for clarification.", "Restate for confirmation.", "Flag assumptions."],
  languageAndThinking: ["Internal dialogue.", "Labeling affects reasoning.", "Poor language → poor decisions."],
  referenceOnly: ["Full dictionaries.", "Thesauri.", "Style manuals.", "Grammar rule edge cases."],
  storageModel: {
    coreIntuitionText: "~20–30 MB",
    embeddingsAssociations: "~30–50 MB",
    referenceIndex: "~5–10 MB",
    totalLocalFootprint: "~60–90 MB",
  },
  endState:
    "ALIVE can read, write, summarize, explain, persuade, document, and clarify with precision appropriate to urgency, audience, and risk.",
} as const;