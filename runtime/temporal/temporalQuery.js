// runtime/temporal/temporalQuery.js

import {
  listMemory
} from "../../memory/store/memoryStore.js";

export function getDueTemporalIntents(now = Date.now()) {
  const all = listMemory({ type: "temporal_intent" }) || [];

  return all.filter(intent => {
    if (intent.fulfilled) return false;

    const trigger = intent.trigger;

    if (trigger.type === "at") {
      return now >= trigger.value;
    }

    if (trigger.type === "after") {
      return now >= intent.created_at + trigger.value;
    }

    // condition-based triggers evaluated elsewhere
    return false;
  });
}

