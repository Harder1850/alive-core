// capabilities/voice/listen.js
//
// Voice listen capability (IO only).
// - Captures audio input and performs speech-to-text.
// - Emits a structured input event.
//
// NOTE: This is scaffolding. It does not run automatically.
// It does not make decisions, plan, or loop.

/**
 * @typedef {{
 *   source: 'human',
 *   type: 'input',
 *   payload: { text: string }
 * }} HumanInputEvent
 */

/**
 * listenOnce({ transcribe })
 *
 * @param {{
 *   transcribe: () => Promise<string> | string
 * }} deps
 * @returns {Promise<HumanInputEvent>}
 */
export async function listenOnce({ transcribe }) {
  if (typeof transcribe !== "function") {
    throw new Error("voice.listen requires a transcribe() function");
  }

  const text = await transcribe();

  if (!text || typeof text !== "string") {
    throw new Error("voice.listen produced no text");
  }

  return {
    source: "human",
    type: "input",
    payload: { text },
  };
}

