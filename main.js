// main.js

import { PersistentMemory } from "./memory/PersistentMemory.js";
import readline from "readline";

const memory = new PersistentMemory();

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
  console.log("\nI’m going to sleep.");
  memory.recordEvent("shutdown", "Process interrupted");
  process.exit(0);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("> ", (input) => {
  memory.recordEvent("input", input);

  if (input.toLowerCase().startsWith("my name is")) {
    const name = input.slice(10).trim();
    memory.setIdentityField("name", name);
    memory.updateSummary(`User's name is ${name}.`);

    const responseText = `Got it. Your name is ${name}.`;
    memory.recordEvent("output", responseText);
    console.log(responseText);
  } else {
    const responseText = "Okay.";
    memory.recordEvent("output", responseText);
    console.log(responseText);
  }

  rl.close();
});
