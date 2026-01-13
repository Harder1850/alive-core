// runtime/conversation/intentRouter.js

import { intentMap } from "./intentMap.js";

export function resolveIntent(input) {
  if (!input || typeof input !== "string") return null;

  const normalized = input.toLowerCase();

  for (const entry of intentMap) {
    for (const phrase of entry.match) {
      if (normalized.includes(phrase)) {
        return entry.handler;
      }
    }
  }

  return null;
}

