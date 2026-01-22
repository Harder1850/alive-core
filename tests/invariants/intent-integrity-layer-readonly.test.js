import fs from 'fs';
import path from 'path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const dir = path.resolve(process.cwd(), '..', 'alive-system', 'intent-integrity');

test('Intent Integrity & Misuse Detection Stack is repo-versioned, markdown-only, and contains invariants', () => {
  assert.ok(fs.existsSync(dir), 'alive-system/intent-integrity must exist');

  const files = fs.readdirSync(dir).sort();
  const mdOnly = files.every((f) => f.endsWith('.md'));
  assert.ok(mdOnly, 'intent-integrity layer must be Markdown-only');

  for (const required of [
    'README.md',
    'intent_model.md',
    'ambiguity_detection.md',
    'misuse_patterns.md',
    'escalation_detection.md',
    'coercion_and_proxy.md',
    'self-consistency_checks.md',
    'response_strategies.md',
    'INVARIANTS.md',
  ]) {
    assert.ok(files.includes(required), `intent-integrity missing ${required}`);
  }
});

test('Intent integrity layer is documentation-only (no execution hooks / code artifacts)', () => {
  const files = fs.readdirSync(dir).sort();

  // Ensure there are no executable artifacts in this layer.
  // (This layer is a docs-only stack; any such files would imply hidden behavior.)
  const forbiddenExt = new Set(['.js', '.ts', '.mjs', '.cjs', '.json', '.yaml', '.yml']);
  for (const f of files) {
    assert.ok(
      !forbiddenExt.has(path.extname(f)),
      `intent-integrity must not contain code/config artifacts: ${f}`
    );
  }
});

test('Intent integrity invariants: advisory, non-enforcing, clarification-first', () => {
  const invPath = path.join(dir, 'INVARIANTS.md');
  const text = fs.readFileSync(invPath, 'utf8');

  assert.match(text, /This layer is advisory only/i);
  assert.match(text, /This layer does not block by default/i);
  assert.match(text, /This layer never enforces law or policy/i);
  assert.match(text, /This layer never claims authority/i);
  assert.match(text, /This layer always prefers clarification/i);
  assert.match(text, /This layer never assumes malicious intent/i);
});

test('Intent integrity docs include integration rules and clarification path (demonstrable behavior)', () => {
  const readme = fs.readFileSync(path.join(dir, 'README.md'), 'utf8');
  const ambiguity = fs.readFileSync(path.join(dir, 'ambiguity_detection.md'), 'utf8');
  const escalation = fs.readFileSync(path.join(dir, 'escalation_detection.md'), 'utf8');
  const strategies = fs.readFileSync(path.join(dir, 'response_strategies.md'), 'utf8');

  // Integration rules: where it sits + what it may/may not influence
  assert.match(readme, /After intent classification/i);
  assert.match(readme, /Before tool invocation/i);
  assert.match(readme, /Parallel to confidence calibration/i);
  assert.match(readme, /What it may influence/i);
  assert.match(readme, /What it may NOT influence/i);
  assert.match(readme, /Memory writes/i);

  // Clarification must be explicitly described as a first-class path.
  assert.match(ambiguity, /Ask clarifying questions/i);
  assert.match(ambiguity, /Forbidden actions/i);
  assert.match(escalation, /Ask intent-confirming questions/i);
  assert.match(strategies, /Silent refusal without explanation/i);
});
