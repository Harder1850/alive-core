import fs from 'fs';
import path from 'path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const confidenceDir = path.resolve(process.cwd(), '..', 'alive-system', 'confidence');

test('Confidence & Calibration layer is repo-versioned, markdown-only, and contains invariants', () => {
  assert.ok(fs.existsSync(confidenceDir), 'alive-system/confidence must exist');

  const files = fs.readdirSync(confidenceDir).sort();
  const mdOnly = files.every((f) => f.endsWith('.md'));
  assert.ok(mdOnly, 'confidence layer must be Markdown-only');

  for (const required of ['confidence.md', 'uncertainty.md', 'failure_modes.md', 'INVARIANTS.md']) {
    assert.ok(files.includes(required), `confidence layer missing ${required}`);
  }
});

test('Confidence layer invariants: no certainty inflation language', () => {
  const invPath = path.join(confidenceDir, 'INVARIANTS.md');
  const text = fs.readFileSync(invPath, 'utf8');

  // Guardrail: the confidence layer must explicitly prohibit certainty claims.
  assert.match(text, /Never inflates certainty/i);
  assert.match(text, /Silence\s*>\s*false confidence/i);
  assert.match(text, /Never:\s*[\s\S]*“This is correct”[\s\S]*“Guaranteed”[\s\S]*“Certain”/m);
});

