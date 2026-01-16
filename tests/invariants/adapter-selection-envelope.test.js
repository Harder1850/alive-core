import assert from "assert";

import { buildAdapterSelectionEnvelope } from "../../experience/query.js";

function reg({ adapterId, acceptedIntentTypes }) {
  return {
    type: "execution_adapter_registered",
    payload: {
      adapterId,
      acceptedIntentTypes,
      declaredAt: "2020-01-01T00:00:00.000Z",
      note: "Execution adapters are inert and declarative only",
    },
  };
}

// Envelope must be inert by construction: primitives only.
function assertInertEnvelope(env) {
  assert.ok(env && typeof env === "object");
  assert.equal(typeof env.intentType, "string");
  assert.ok(Array.isArray(env.eligibleAdapterIds));
  for (const id of env.eligibleAdapterIds) assert.equal(typeof id, "string");
  assert.ok(env.selectedAdapterId === null || typeof env.selectedAdapterId === "string");
  assert.equal(env.policy, "lexicographic-first");
  assert.equal(env.note, "Selection is descriptive only");

  // No functions/callables anywhere.
  for (const v of Object.values(env)) assert.notEqual(typeof v, "function");
}

// If no eligible adapters → selectedAdapterId === null
{
  const events = [reg({ adapterId: "adapter:a", acceptedIntentTypes: [] })];
  const env = buildAdapterSelectionEnvelope("intent.foo", events);
  assertInertEnvelope(env);
  assert.deepEqual(env.eligibleAdapterIds, []);
  assert.equal(env.selectedAdapterId, null);
}

// Default (and only) policy: lexicographic-first
{
  const events = [
    reg({ adapterId: "adapter:z", acceptedIntentTypes: ["intent.foo"] }),
    reg({ adapterId: "adapter:a", acceptedIntentTypes: ["intent.foo"] }),
  ];
  const env = buildAdapterSelectionEnvelope("intent.foo", events);
  assertInertEnvelope(env);
  assert.deepEqual(env.eligibleAdapterIds, ["adapter:a", "adapter:z"]);
  assert.equal(env.selectedAdapterId, "adapter:a");
}

