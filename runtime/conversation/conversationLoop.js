// runtime/conversation/conversationLoop.js

import { resolveIntent } from "./intentRouter.js";

import { runWakeTask } from "../wake/wakeTask.js";
import { runCapabilitiesTask } from "../capabilities/capabilitiesTask.js";
import { runRememberTask } from "../remember/rememberTask.js";
import { runRecallTask } from "../recall/recallTask.js";

export function handleInput({ input, output }) {
  const intent = resolveIntent(input);

  if (!intent) {
    output.emit("I’m not sure how to help with that yet.");
    return;
  }

  switch (intent) {
    case "wake":
      return runWakeTask({ output });

    case "capabilities":
      return runCapabilitiesTask({ output });

    case "remember":
      return runRememberTask({
        content: extractContent(input),
        output
      });

    case "recall":
      return runRecallTask({ output });

    default:
      output.emit("That capability isn’t wired yet.");
  }
}

function extractContent(input) {
  // Very naive for now: strip the word "remember"
  return input.replace(/remember/i, "").trim();
}

