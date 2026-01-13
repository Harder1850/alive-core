// runtime/experienceWriter.js

import { drainEvents } from "./eventBus.js";
import { recordEvent } from "../experience/recorder.js";

let _timer = null;

export function startExperienceWriter({ intervalMs = 250 } = {}) {
  if (_timer) return;
  _timer = setInterval(async () => {
    const batch = drainEvents(200);
    for (const e of batch) {
      try {
        await recordEvent(e);
      } catch {
        // best-effort: do not crash loop
      }
    }
  }, intervalMs);
}

export function stopExperienceWriter() {
  if (_timer) clearInterval(_timer);
  _timer = null;
}

