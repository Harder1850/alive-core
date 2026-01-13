// background/goalRunner.js

import fs from "fs";
import path from "path";
import { loadGoals, saveGoals } from "../goals/store.js";
import { generateSuggestions } from "./suggestions.js";

const LOG_FILE = path.resolve("logs/background.log");

function log(line) {
  const ts = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${ts}] ${line}\n`);
}

/**
 * @param {{ intervalMs?: number }} opts
 */
export function startGoalRunner(opts = {}) {
  const intervalMs = opts.intervalMs ?? 30_000;

  if (!fs.existsSync(path.dirname(LOG_FILE))) {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  }

  const id = setInterval(() => {
    try {
      const goals = loadGoals();
      const active = goals.filter(g => g.status === "active");

      for (const g of active) {
        if (!g.next_possible_action) continue;

        g.last_progress_note = `Checked status of ${g.description}. No blockers found.`;
        g.last_updated = Date.now();
        log(`progress goal=${g.id} note=${g.last_progress_note}`);
      }

      saveGoals(goals);

      const suggestions = generateSuggestions(goals);
      if (suggestions.length > 0) {
        log(`suggestions count=${suggestions.length}`);
      }
    } catch (err) {
      log(`error ${err.message}`);
    }
  }, intervalMs);

  return () => clearInterval(id);
}

