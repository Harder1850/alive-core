/**
 * body/index.js
 *
 * ALIVE Virtual Body — Lifecycle Skeleton
 *
 * STATUS: STRUCTURAL / NON-COGNITIVE
 *
 * This file defines the high-level lifecycle of the Virtual Body.
 * It MUST remain procedural, explicit, and boring.
 *
 * The Body:
 *  - perceives
 *  - logs
 *  - consults
 *  - acts
 *
 * The Body does NOT:
 *  - reason normatively
 *  - judge correctness
 *  - invent goals
 *  - override the Brain
 *
 * Any deviation from this structure is an architectural violation.
 */

// ─────────────────────────────────────────────────────────────
// Imports (Body-only)
// ─────────────────────────────────────────────────────────────

// Configuration (body-scoped only)
import { loadBodyConfig } from "./config/body.config.js";

// Perception
import { collectSenseEvents } from "./senses/index.js";

// Environment / context
import { collectEnvironmentContext } from "./environment/index.js";

// Experience logging (append-only)
import { recordExperience } from "./events/record.js";

// Brain interface (FIREWALL — do not bypass)
import { consultBrain } from "./nervous-system/alive-bridge.js";

// Actuation (execution)
import { performActuation } from "./actuators/index.js";

// ─────────────────────────────────────────────────────────────
// Body Lifecycle
// ─────────────────────────────────────────────────────────────

// Lifecycle mode (body-scoped, demo-safe)
// Allowed values: "demo" (default), "continuous" (NOT authorized)
const BODY_LIFECYCLE_MODE = process.env.BODY_MODE || "demo";

/**
 * startBody()
 *
 * Entry point for the Virtual Body.
 * This function owns the real-time loop.
 *
 * The Brain is advisory only.
 */
export async function startBody() {
  logLifecycleEvent("body.lifecycle.start", {
    mode: BODY_LIFECYCLE_MODE,
  });

  if (BODY_LIFECYCLE_MODE === "demo") {
    await runSingleObservationCycle();
    logLifecycleEvent("body.lifecycle.end", {
      mode: BODY_LIFECYCLE_MODE,
      reason: "demo.shutdown",
    });
    console.log("[body] Demo mode complete — shutting down cleanly.");
    return;
  }

  if (BODY_LIFECYCLE_MODE === "continuous") {
    throw new Error("Continuous body lifecycle is not yet authorized");
  }

  throw new Error(
    `Unknown BODY_MODE: ${BODY_LIFECYCLE_MODE}. Allowed: demo, continuous`
  );

  // Load body-only configuration
  const config = loadBodyConfig();

  // Initialize body state (non-cognitive)
  initializeBodyState(config);

  // Main lifecycle loop
  while (true) {
    try {
      // 1. Collect sensory input (NO interpretation)
      const senseEvents = await collectSenseEvents();

      // 2. Collect environment context (time, system state, etc.)
      const environmentContext = collectEnvironmentContext();

      const timestamp = new Date().toISOString();

      // 3. Record all observations as experience (append-only)
      recordExperience({
        type: "body.observation",
        senseEvents,
        environmentContext,
        timestamp,
      });

      // 4. Consult the Brain for judgment (DESCRIPTIVE ONLY)
      const brainResponse = await consultBrain({
        consultationId: generateConsultationId(),
        observations: senseEvents,
        environment: environmentContext,
        // Optional fields (present but inert)
        bodyState: {},
        question: "",
        timestamp,
      });

      // 5. Decide body-level response
      // NOTE: This decision is procedural, not normative.
      // The Body chooses HOW to act within Brain constraints,
      // not WHETHER something is right or allowed.
      const bodyAction = selectBodyAction(brainResponse, config);

      // 6. Perform actuation (execution lives here)
      await performActuation(bodyAction);

      // 7. Loop timing / pacing (body-controlled)
      await applyBodyTiming(config);
    } catch (err) {
      // 8. Failure handling (fail safe, log everything)
      handleBodyError(err);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Demo Mode (Single-Cycle, No Loops)
// ─────────────────────────────────────────────────────────────

async function runSingleObservationCycle() {
  // Load body-only configuration
  const config = loadBodyConfig();

  // Initialize body state (non-cognitive)
  initializeBodyState(config);

  try {
    // 1. Collect sensory input (NO interpretation)
    const senseEvents = await collectSenseEvents();

    // 2. Collect environment context (time, system state, etc.)
    const environmentContext = collectEnvironmentContext();

    const timestamp = new Date().toISOString();

    // 3. Record all observations as experience (append-only)
    recordExperience({
      type: "body.observation",
      senseEvents,
      environmentContext,
      timestamp,
    });

    // 4. Consult the Brain for judgment (DESCRIPTIVE ONLY)
    await consultBrain({
      consultationId: generateConsultationId(),
      observations: senseEvents,
      environment: environmentContext,
      // Optional fields (present but inert)
      bodyState: {},
      question: "",
      timestamp,
    });

    // 5. Perform noop actuation only
    const bodyAction = selectBodyAction({ judgment: "no-op" }, config);
    await performActuation(bodyAction);

    logLifecycleEvent("body.observation.complete", {
      timestamp,
    });
  } catch (err) {
    handleBodyError(err);
  }
}

// ─────────────────────────────────────────────────────────────
// Internal Helpers (Body-only, Non-Cognitive)
// ─────────────────────────────────────────────────────────────

function initializeBodyState(config) {
  // Initialize connections, buffers, caches, etc.
  // Must NOT initialize cognition or memory.
}

function selectBodyAction(brainResponse, config) {
  // Translate Brain descriptions into body-level execution choices.
  // Must NOT reinterpret Brain judgments.
  // Must NOT invent new goals.
  return {
    type: "noop", // placeholder
  };
}

async function applyBodyTiming(config) {
  // Handle pacing, sleeps, scheduling, retries, etc.
  // Body owns time.
}

function handleBodyError(err) {
  // Log error as experience.
  // Fail closed.
  // Never suppress errors silently.
  console.error("Body error:", err);
}

function generateConsultationId() {
  // Non-semantic identifier. No meaning, no ordering guarantees.
  return `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function logLifecycleEvent(type, data = {}) {
  // Descriptive, append-only lifecycle events.
  // No interpretation. No evaluation.
  const timestamp = new Date().toISOString();
  recordExperience({
    type,
    timestamp,
    ...data,
  });
}
