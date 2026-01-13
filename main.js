// main.js

import { PersistentMemory } from "./memory/PersistentMemory.js";
import { summarizeRecentEvents } from "./runtime/summarizer.js";
import { parseIntent } from "./runtime/intents.js";
import { attachTrust, checkPermission } from "./runtime/permissions.js";
import { schedule, clearAll } from "./runtime/scheduler.js";
import { onWake, onSleep } from "./runtime/lifecycle.js";
import { WindowsAdapter } from "./adapters/windows/index.js";
import { search } from "./adapters/browser/index.js";
import { speak } from "./services/voice/tts.js";
import * as filesystem from "./adapters/filesystem/index.js";
import * as clipboard from "./adapters/clipboard/index.js";
import { notify } from "./adapters/notifications/index.js";
import * as permissions from "./runtime/confirmations.js";
import { recordHabit } from "./runtime/habits.js";
import { updateMood, getMood } from "./runtime/emotions.js";
import { addGoal, listGoals } from "./runtime/goals.js";
import { trustCommand, isTrusted } from "./memory/trust.js";
import { reflect } from "./services/reflection/index.js";
import { addGoal as persistGoal, loadGoals, updateGoal } from "./goals/store.js";
import { startGoalRunner } from "./background/goalRunner.js";
import { getGoalSummary } from "./goals/summary.js";

import "./services/watchdog/index.js";
import "./ui/tray.js";

const memory = new PersistentMemory();
attachTrust({ isTrusted });

let notificationsEnabled = false;

const stopGoalRunner = startGoalRunner({ intervalMs: 30_000 });

console.log("ALIVE booting...");
onWake(memory.getIdentity().name);

const summary = memory.getSummary();
if (summary) {
  console.log("Here’s what I remember:");
  console.log(summary);
}

let interactionCount = 0;

process.on("SIGINT", () => {
  summarizeRecentEvents(memory);
  onSleep();
  memory.recordEvent("shutdown", "Process interrupted");
  clearAll();
  stopGoalRunner();
  process.exit(0);
});

// Daemon-enough (keeps process alive)
setInterval(() => {}, 1000);

process.stdin.setEncoding("utf8");
process.stdin.resume();

process.stdin.on("data", async (data) => {
  const input = data.toString().trim();
  if (!input) return;

  memory.recordEvent("input", input);
  interactionCount++;

  updateMood(input.toLowerCase());

  const intent = parseIntent(input);
  recordHabit(intent.type);
  const permission = checkPermission(intent);

  if (permission === "CONFIRM") {
    console.log("Confirm command execution by repeating it.");
    return;
  }

  let response = "I didn’t understand that.";

  try {
    switch (intent.type) {
      case "OPEN_APP":
        WindowsAdapter.openApp(intent.value);
        response = `Opening ${intent.value}`;
        memory.recordEvent("action", `openApp:${intent.value}`);
        break;

      case "LIST_FILES":
        response = WindowsAdapter.listFiles(".");
        break;

      case "RUN_COMMAND":
        WindowsAdapter.runCommand(intent.value);
        response = "Running command.";
        memory.recordEvent("command", intent.value);
        break;

      case "REMEMBER":
        memory.setPreference("note", intent.value);
        response = "I’ll remember that.";
        break;

      case "SEARCH_FILES":
        response = filesystem.searchFiles(".", intent.value);
        break;

      case "CONFIRM_DELETE": {
        const key = `delete:${intent.value}`;
        permissions.requestConfirmation(key);
        response = `Confirmation recorded for delete ${intent.value}. Now repeat delete file ${intent.value}.`;
        break;
      }

      case "TRUST_DELETE": {
        const key = `delete:${intent.value}`;
        trustCommand(key);
        response = `Trusted: delete ${intent.value}`;
        break;
      }

      case "DELETE_FILE": {
        const key = `delete:${intent.value}`;
        if (!isTrusted(key) && !permissions.isConfirmed(key)) {
          permissions.requestConfirmation(key);
          response = `This will permanently delete ${intent.value}. Say "confirm delete ${intent.value}" to proceed. You can trust this command to skip confirmation in the future.`;
          break;
        }

        filesystem.deleteFile(intent.value);
        memory.recordEvent("destructive", {
          action: intent.type,
          target: intent.value,
          time: Date.now(),
        });
        permissions.clearConfirmation(key);
        response = `Deleted ${intent.value}.`;
        break;
      }

      case "COPY":
        clipboard.copy(String(intent.value));
        response = "Copied.";
        break;

      case "PASTE":
        response = await clipboard.paste();
        break;

      case "ADD_GOAL": {
        const now = Date.now();
        const id = `g_${now}`;
        persistGoal({
          id,
          description: String(intent.value).trim(),
          intent: "user-requested",
          priority: 1,
          status: "active",
          created_at: now,
          last_updated: now,
          last_progress_note: "",
          next_possible_action: "review",
          dependencies: [],
        });
        response = `Goal added: ${id}`;
        break;
      }

      case "LIST_GOALS":
        response = loadGoals();
        break;

      case "ENABLE_NOTIFICATIONS":
        notificationsEnabled = true;
        response = "Notifications enabled.";
        break;

      case "DISABLE_NOTIFICATIONS":
        notificationsEnabled = false;
        response = "Notifications disabled.";
        break;

      // v0.5 add-ons (safe core)
      case "UNKNOWN": {
        const text = String(intent.value).toLowerCase();
        if (text === "goal summary") {
          response = getGoalSummary();
          break;
        }
        if (text.startsWith("goal ")) {
          // Legacy in-memory goals
          addGoal(text.replace("goal ", ""));
          response = "Goal added.";
          break;
        }
        if (text === "what are my goals") {
          response = listGoals();
          break;
        }
        if (text.startsWith("trust ")) {
          const cmd = text.replace("trust ", "");
          trustCommand(cmd);
          response = `Trusted: ${cmd}`;
          break;
        }

        search(intent.value);
        response = "Searching.";
        break;
      }

      case "RECALL":
        response = memory.getSummary();
        break;
    }
  } catch (err) {
    response = `Error: ${err.message}`;
  }

  if (interactionCount % 10 === 0) {
    schedule(() => summarizeRecentEvents(memory), 0);
  }

  const mood = getMood();
  const responseText = typeof response === "string" ? response : JSON.stringify(response, null, 2);

  console.log(responseText);
  speak(responseText);
  memory.recordEvent("output", responseText);

  if (notificationsEnabled) {
    // If BurntToast isn't installed, notify() silently no-ops.
    notify(responseText);
  }

  const suggestion = reflect(memory.getSummary() || "");
  if (suggestion) {
    console.log(`[reflection/${mood}] ${suggestion}`);
  }
});
