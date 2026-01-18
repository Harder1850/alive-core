/**
 * Body-only configuration loader.
 * MUST remain non-cognitive and side-effect minimal.
 */
export function loadBodyConfig() {
  return {
    // Lifecycle pacing (placeholder)
    tickMs: 250,

    // Body mode markers (placeholder)
    mode: "sandbox",

    // Hard bounds for future actuators (placeholder)
    limits: {
      maxRequestsPerTick: 1,
      maxPayloadBytes: 256_000,
      timeoutMs: 5_000,
    },
  };
}

