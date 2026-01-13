#!/usr/bin/env node
/**
 * bin/alive.js
 *
 * Minimal CLI for ALIVE demos.
 */

const command = process.argv[2];

switch (command) {
  case "wake":
    // ESM loader for scripts/wake.js
    import("../scripts/wake.js");
    break;

  default:
    console.log(`
ALIVE CLI

Usage:
  alive wake     Wake up and narrate remembered experience
`);
}

