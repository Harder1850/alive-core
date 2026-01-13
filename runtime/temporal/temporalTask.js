// runtime/temporal/temporalTask.js

import {
  storeMemory
} from "../../memory/store/memoryStore.js";

import {
  recordEvent
} from "../../experience/recorder.js";

export function runTemporalTask({
  content,
  trigger,
  importance = "normal",
  output
}) {
  if (!content || !trigger) {
    throw new Error("Temporal intent requires content and a trigger.");
  }

  const temporalIntent = {
    id: `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    type: "temporal_intent",
    content,
    trigger,
    importance,
    created_at: Date.now(),
    last_accessed: Date.now(),
    access_count: 0,
    tags: ["temporal_intent", importance],
    decay_score: 1.0,
    fulfilled: false
  };

  storeMemory(temporalIntent);

  output.emit(formatConfirmation(temporalIntent));

  recordEvent({
    source: "user",
    type: "temporal_intent",
    payload: temporalIntent
  });

  return temporalIntent;
}

function formatConfirmation(intent) {
  return `
Okay. I’ll bring this up later.

What: "${intent.content}"
When: ${formatTrigger(intent.trigger)}
Importance: ${intent.importance}
`.trim();
}

function formatTrigger(trigger) {
  if (trigger.type === "at") return `at ${new Date(trigger.value).toString()}`;
  if (trigger.type === "after") return `after ${trigger.value} ms`;
  if (trigger.type === "condition") return `when condition is met`;
  return "unknown time";
}

