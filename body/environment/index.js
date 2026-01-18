/**
 * Environment entrypoint.
 * MUST provide context without meaning, prediction, or recommendations.
 */
export function collectEnvironmentContext() {
  return {
    now: new Date().toISOString(),
    // Placeholder flags; wire up later
    online: false,
    mode: "sandbox",
  };
}

