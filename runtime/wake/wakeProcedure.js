// runtime/wake/wakeProcedure.js

export const wakeProcedure = {
  id: "proc_system_wake",
  intent: "system.wake",
  description: "Wake up, recall recent experience, report capabilities and needs",

  required_capabilities: [
    "output.text" // console for now, voice later
  ],

  steps: [
    { id: "load_experience", action: "experience.load_recent" },
    { id: "build_narrative", action: "experience.build_narrative" },
    { id: "list_capabilities", action: "capabilities.list_available" },
    { id: "emit_report", action: "output.report" }
  ],

  validation: {
    success_conditions: [
      { type: "report_emitted" }
    ]
  },

  metadata: {
    source: "system",
    confidence: 1.0,
    executions: 0
  },

  retention: {
    decay_rate: 0,
    reinforce_on_success: false
  }
};

