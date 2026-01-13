// runtime/remember/rememberProcedure.js

export const rememberProcedure = {
  id: "proc_system_remember",
  intent: "system.remember",
  description: "Intentionally store information for future recall",

  required_capabilities: [
    "memory.store",
    "output.text"
  ],

  inputs: {
    content: "string",
    category: "preference | reminder | rule | note | goal",
    importance: "low | normal | high"
  },

  steps: [
    { id: "validate_input", action: "remember.validate" },
    { id: "store_memory", action: "memory.store" },
    { id: "confirm_storage", action: "output.confirm" }
  ],

  validation: {
    success_conditions: [
      { type: "memory_stored" }
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

