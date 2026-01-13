// main.js

import { PersistentMemory } from "./memory/PersistentMemory.js";
import readline from "readline";
import { summarizeRecentEvents } from "./runtime/summarizer.js";
import { openApp } from "./adapters/windows/index.js";

const memory = new PersistentMemory();
let interactionCount = 0;

console.log("ALIVE booting...");

const identity = memory.getIdentity();
if (!identity.name) {
  console.log("Hello. I’m here.");
} else {
  console.log(`I’m back, ${identity.name}.`);
}

const summary = memory.getSummary();
if (summary) {
  console.log("Here’s what I remember:");
  console.log(summary);
}

process.on("SIGINT", () => {
  summarizeRecentEvents(memory);
  console.log("\nI’m going to sleep.");
  memory.recordEvent("shutdown", "Process interrupted");
  process.exit(0);
});

// Daemon-enough idle loop (keeps process alive when stdin is quiet)
setInterval(() => {}, 1000);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt() {
  rl.question("> ", (input) => {
    memory.recordEvent("input", input);
    interactionCount++;

    if (input.toLowerCase().startsWith("my name is")) {
      const name = input.slice(10).trim();
      memory.setIdentityField("name", name);
      memory.updateSummary(`User's name is ${name}.`);

      const responseText = `Got it. Your name is ${name}.`;
      memory.recordEvent("output", responseText);
      console.log(responseText);
    } else if (input.toLowerCase().startsWith("open ")) {
      const target = input.slice(5).trim();
      openApp(target)
        .then(() => {
          const responseText = `Opened ${target}.`;
          memory.recordEvent("action", `openApp:${target}`);
          memory.recordEvent("output", responseText);
          console.log(responseText);
        })
        .catch((err) => {
          const responseText = `Could not open ${target}: ${err.message}`;
          memory.recordEvent("output", responseText);
          console.log(responseText);
        });
    } else {
      const responseText = "Okay.";
      memory.recordEvent("output", responseText);
      console.log(responseText);
    }

    if (interactionCount % 10 === 0) {
      summarizeRecentEvents(memory);
    }

    prompt();
  });
}

prompt();
