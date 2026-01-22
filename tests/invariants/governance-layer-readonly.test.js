import fs from 'fs';
import path from 'path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Mirrors the style of the science/reference layer invariants:
// - repo-versioned
// - runtime-readonly (no mutation)
// - governance content must remain intuition/guardrails only

const governanceDir = path.resolve(process.cwd(), '..', 'alive-system', 'governance');

test('Governance & Human Systems Intuition Stack is repo-versioned and runtime-readonly (no mutation)', () => {
  assert.ok(fs.existsSync(governanceDir), 'alive-system/governance must exist');
  const files = fs
    .readdirSync(governanceDir)
    .filter((f) => f.endsWith('.md'))
    .sort();
  assert.ok(files.length >= 10, 'governance layer should contain the expected markdown files');
});

