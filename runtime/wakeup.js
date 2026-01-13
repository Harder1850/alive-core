/**
 * runtime/wakeup.js
 *
 * Handles system wake-up behavior.
 * Builds a brief narrative from recent experience.
 *
 * NOTE:
 * - No imports from /spine
 * - Purely observational
 */

import {
  isInitialized,
  getRecentSegments,
  buildBriefSummary,
} from "../experience/index.js";

import { hasCapability, isAvailable, registerCapability } from "../capabilities/registry.js";
import { speak } from "../adapters/voice/speak.js";

function ensureVoiceCapabilityRegistered() {
  // idempotent best-effort auto-registration
  if (hasCapability("voice.tts")) return;
  try {
    registerCapability({
      id: "voice.tts",
      name: "Text-to-Speech",
      type: "hardware",
      interface: { protocol: "local-tts" },
      availability: "available",
    });
  } catch {
    // ignore if it already exists or store isn't writable
  }
}

function maybeSpeak(text) {
  ensureVoiceCapabilityRegistered();
  if (hasCapability("voice.tts") && isAvailable("voice.tts")) {
    speak(text);
  }
}

export function wakeUp() {
  // If experience system isn’t initialized yet, nothing to recall
  if (!isInitialized()) {
    console.log("I'm awake for the first time.");
    maybeSpeak("I'm awake for the first time.");
    return;
  }

  // Load recent experience segments
  const segments = getRecentSegments({
    windowMs: 60_000,
    count: 3,
  });

  if (!segments || segments.length === 0) {
    console.log("I'm back, but I don't have any prior experiences yet.");
    maybeSpeak("I'm back, but I don't have any prior experiences yet.");
    return;
  }

  // Build a short narrative summary
  const summary = buildBriefSummary(segments);

  console.log("I'm back.");
  console.log("Here's what I remember:");
  console.log(summary);

  maybeSpeak(`I'm back. Here's what I remember. ${summary}`);
}
