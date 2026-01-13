// runtime/intentTranslator.js
//
// Minimal text-to-intent translator.
// Deterministic rules only: no persistence, no learning, no execution.

export function translateTextToIntent(text = "") {
  const t = String(text).toLowerCase();

  if (t.includes("organize") && t.includes("download")) {
    return { intent: "organize_downloads" };
  }

  if (t.includes("demo") && t.includes("website")) {
    return { intent: "generate_demo_site" };
  }

  if (t.includes("what") && t.includes("remember")) {
    return { intent: "query_memory" };
  }

  return { intent: "unknown" };
}
