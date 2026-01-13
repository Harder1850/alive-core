// capabilities/voice/speak.js
//
// Voice speak capability (IO only).
// - Converts text to speech using an injected driver.
// - No formatting decisions, no cognition, no loops.

/**
 * speakText({ text, speak })
 *
 * @param {{
 *   text: string,
 *   speak: (text: string) => Promise<void> | void
 * }} deps
 */
export async function speakText({ text, speak }) {
  if (!text || typeof text !== "string") return;
  if (typeof speak !== "function") {
    throw new Error("voice.speak requires a speak() function");
  }

  await speak(text);
}

