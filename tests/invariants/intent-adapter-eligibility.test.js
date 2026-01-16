import assert from "assert";

import { resolveEligibleExecutionAdapters } from "../../experience/query.js";

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

// ✅ single adapter accepts intent → returned
{
  const events = [reg({ adapterId: "adapter:a", acceptedIntentTypes: ["intent.foo"] })];
  const res = resolveEligibleExecutionAdapters("intent.foo", events);
  assert.deepEqual(res, { eligibleAdapterIds: ["adapter:a"], reason: "declared-compatibility" });
}

// ✅ multiple adapters accept same intent → all returned, sorted
{
  const events = [
    reg({ adapterId: "adapter:z", acceptedIntentTypes: ["intent.foo"] }),
    reg({ adapterId: "adapter:a", acceptedIntentTypes: ["intent.foo"] }),
  ];
  const res = resolveEligibleExecutionAdapters("intent.foo", events);
  assert.deepEqual(res, { eligibleAdapterIds: ["adapter:a", "adapter:z"], reason: "declared-compatibility" });
}

// ❌ adapter registered with empty acceptedIntentTypes → not eligible
{
  const events = [reg({ adapterId: "adapter:a", acceptedIntentTypes: [] })];
  const res = resolveEligibleExecutionAdapters("intent.foo", events);
  assert.deepEqual(res, { eligibleAdapterIds: [], reason: "declared-compatibility" });
}

// ❌ no adapters registered → empty result
{
  const events = [];
  const res = resolveEligibleExecutionAdapters("intent.foo", events);
  assert.deepEqual(res, { eligibleAdapterIds: [], reason: "declared-compatibility" });
}

// ❌ adapters registered but none match intent → empty result
{
  const events = [reg({ adapterId: "adapter:a", acceptedIntentTypes: ["intent.bar"] })];
  const res = resolveEligibleExecutionAdapters("intent.foo", events);
  assert.deepEqual(res, { eligibleAdapterIds: [], reason: "declared-compatibility" });
}

// ❌ duplicate adapter registrations (should be impossible due to Phase 25) → still unique IDs
{
  const events = [
    reg({ adapterId: "adapter:a", acceptedIntentTypes: ["intent.foo"] }),
    reg({ adapterId: "adapter:a", acceptedIntentTypes: ["intent.foo"] }),
  ];
  const res = resolveEligibleExecutionAdapters("intent.foo", events);
  assert.deepEqual(res, { eligibleAdapterIds: ["adapter:a"], reason: "declared-compatibility" });
}

