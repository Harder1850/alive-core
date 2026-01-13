// main.js

import { PersistentMemory } from "./memory/PersistentMemory.js";
import readline from "readline";

const memory = new PersistentMemory();

console.log("ALIVE booting...");

const identity = memory.getIdentity();
if (!identity.name) {
  console.log("I don't know your name yet.");
} else {
  console.log(`Welcome back, ${identity.name}.`);
}

if (memory.getSummary()) {
  console.log("What I remember:");
  console.log(memory.getSummary());
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("> ", (input) => {
  if (input.toLowerCase().startsWith("my name is")) {
    const name = input.slice(10).trim();
    memory.setIdentityField("name", name);
    memory.recordEvent("identity", `User name set to ${name}`);
    memory.updateSummary(`User's name is ${name}.`);
    console.log(`Got it. Your name is ${name}.`);
  } else {
    memory.recordEvent("interaction", input);
    console.log("Okay.");
  }

  rl.close();
});

