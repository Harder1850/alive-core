// runtime/capabilities/capabilitiesProcedure.js

export const capabilitiesProcedure = {
  id: "proc_system_capabilities",
  intent: "system.capabilities",
  description: "Report currently available capabilities",

  required_capabilities: [
    "output.text" // console now, voice later
  ],

  steps: [
    { id: "list_capabilities", action: "capabilities.list_available" },
    { id: "emit_report", action: "output.report" }
  ],

  validation: {
    success_conditions: [
      { type: "capabilities_report_emitted" }
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

