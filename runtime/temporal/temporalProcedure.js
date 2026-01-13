// runtime/temporal/temporalProcedure.js

export const temporalProcedure = {
  id: "proc_system_temporal_intent",
  intent: "system.defer",
  description: "Store an action or reminder to be surfaced later",

  required_capabilities: [
    "memory.store",
    "time.now",
    "output.text"
  ],

  inputs: {
    content: "string",
    trigger: {
      type: "at | after | condition",
      value: "string | number"
    },
    importance: "low | normal | high"
  },

  steps: [
    { id: "validate_input", action: "temporal.validate" },
    { id: "store_temporal_intent", action: "memory.store" },
    { id: "confirm_defer", action: "output.confirm" }
  ],

  validation: {
    success_conditions: [
      { type: "temporal_intent_stored" }
    ]
  },

  metadata: {
    source: "user",
    confidence: 1.0,
    executions: 0
  },

  retention: {
    decay_rate: 0,
    reinforce_on_success: true
  }
};

