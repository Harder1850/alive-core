import assert from "assert";
import fs from "fs";
import os from "os";
import path from "path";

import { initializeRecorder, recordEvent } from "../../experience/recorder.js";
import { createBaseEvent, getExecutionAdapterRegistrationNote, validateEvent } from "../../experience/schema.js";

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "alive-core-invariants-"));
}

function validPayload({ adapterId = "adapter:test-1" } = {}) {
  return {
    adapterId,
    acceptedIntentTypes: ["intent.type.example"],
    declaredAt: new Date("2020-01-01T00:00:00.000Z").toISOString(),
    note: getExecutionAdapterRegistrationNote(),
  };
}

// Minimal harness: this repo's invariant runner imports files; assertions execute at module load.
(async () => {
  const dir = makeTempDir();
  initializeRecorder({ dataDir: dir });

  // ✅ valid registration → accepted
  await recordEvent({
    source: "system",
    type: "execution_adapter_registered",
    payload: validPayload({ adapterId: "adapter:one" }),
  });

  // Helper: create event -> validateEvent -> expect false
  function expectInvalid(payload) {
    const evt = createBaseEvent({ source: "system", type: "execution_adapter_registered", payload });
    assert.equal(validateEvent(evt), false);
  }

  // ❌ missing adapterId → rejected
  expectInvalid({
    acceptedIntentTypes: ["intent.type.example"],
    declaredAt: new Date("2020-01-01T00:00:00.000Z").toISOString(),
    note: getExecutionAdapterRegistrationNote(),
  });

  // ❌ empty string inside acceptedIntentTypes → rejected
  expectInvalid({
    adapterId: "adapter:two",
    acceptedIntentTypes: [""],
    declaredAt: new Date("2020-01-01T00:00:00.000Z").toISOString(),
    note: getExecutionAdapterRegistrationNote(),
  });

  // ❌ invalid declaredAt timestamp → rejected
  expectInvalid({
    adapterId: "adapter:two",
    acceptedIntentTypes: ["intent.type.example"],
    declaredAt: "not-a-date",
    note: getExecutionAdapterRegistrationNote(),
  });

  // ❌ note mismatch → rejected
  expectInvalid({
    adapterId: "adapter:two",
    acceptedIntentTypes: ["intent.type.example"],
    declaredAt: new Date("2020-01-01T00:00:00.000Z").toISOString(),
    note: "wrong",
  });

  // ❌ duplicate adapterId registration → rejected (identity immutability)
  // NOTE: Phase 25 requires this to fail due to schema enforcement.
  // The simplest enforcement is to reject duplicates at record-time.
  let threw = false;
  try {
    await recordEvent({
      source: "system",
      type: "execution_adapter_registered",
      payload: validPayload({ adapterId: "adapter:one" }),
    });
  } catch {
    threw = true;
  }
  assert.equal(threw, true);
})();

