// runtime/recall/recallProcedure.js

export const recallProcedure = {
  id: "proc_system_recall",
  intent: "system.recall",
  description: "Recall previously stored intentional memory",

  required_capabilities: [
    "memory.query",
    "output.text"
  ],

  inputs: {
    category: "preference | reminder | rule | note | goal | any",
    query: "string?",
    limit: "number?"
  },

  steps: [
    { id: "query_memory", action: "memory.query" },
    { id: "format_results", action: "recall.format" },
    { id: "emit_results", action: "output.report" }
  ],

  validation: {
    success_conditions: [
      { type: "recall_report_emitted" }
    ]
  },

  metadata: {
    source: "user",
    confidence: 1.0,
    executions: 0
  },

  retention: {
    decay_rate: 0,
    reinforce_on_success: false
  }
};

