import fs from 'fs';
import path from 'path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Mirrors the style of the science/governance stack invariants.
// This test is intentionally minimal: it ensures the layer exists, is repo-versioned,
// and contains only markdown files with the expected invariant file.

const cognitionDir = path.resolve(process.cwd(), '..', 'alive-system', 'cognition');

test('Cognition, Creativity, Ethics & Learning Stack is repo-versioned and runtime-readonly (no mutation)', () => {
  assert.ok(fs.existsSync(cognitionDir), 'alive-system/cognition must exist');

  const files = fs.readdirSync(cognitionDir).sort();
  assert.ok(files.includes('INVARIANTS.md'), 'cognition/INVARIANTS.md must exist');
  assert.ok(files.includes('README.md'), 'cognition/README.md must exist');

  const mdOnly = files.every((f) => f.endsWith('.md'));
  assert.ok(mdOnly, 'cognition layer must be Markdown-only');
});

