// runtime/remember/rememberTask.js

import {
  storeMemory
} from "../../memory/store/memoryStore.js";

import {
  recordEvent
} from "../../experience/recorder.js";

export function runRememberTask({ content, category = "note", importance = "normal", output }) {
  // Step 1 — Validate input
  if (!content || typeof content !== "string") {
    throw new Error("Nothing to remember.");
  }

  // Step 2 — Store memory (passive, file-based)
  const memoryEntry = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    type: "note",
    content,
    created_at: Date.now(),
    last_accessed: Date.now(),
    access_count: 0,
    tags: ["intentional_memory", category, importance],
    decay_score: 1.0,

    // extra fields used by recallTask (kept as plain data)
    category,
    importance,
  };

  storeMemory(memoryEntry);

  // Step 3 — Confirm to user
  const confirmation = formatConfirmation(memoryEntry);
  output.emit(confirmation);

  // Step 4 — Record experience
  recordEvent({
    source: "user",
    type: "remember",
    payload: memoryEntry
  });

  return memoryEntry;
}

function formatConfirmation(entry) {
  return `
Got it. I’ll remember this.

Category: ${entry.category}
Importance: ${entry.importance}
Content: "${entry.content}"
`.trim();
}

