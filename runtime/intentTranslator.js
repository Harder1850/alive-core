// runtime/intentTranslator.js
//
// Minimal text-to-intent translator.
// Deterministic rules only: no persistence, no learning, no execution.

export function translateTextToIntent(text = "") {
  const t = String(text).toLowerCase();

  if (t.includes("organize") && t.includes("download")) {
    // Phase 12: always return intents[] for deterministic multi-intent ticks.
    return { intents: ["organize_downloads"] };
  }

  if (t.includes("demo") && t.includes("website")) {
    return { intents: ["generate_demo_site"] };
  }

  if (t.includes("what") && t.includes("remember")) {
    return { intents: ["query_memory"] };
  }

  return { intents: ["unknown"] };
}
