/**
 * ALIVE SPINE — AUTHORITATIVE LOOP
 *
 * Invariants:
 * 1 — Exactly one spine
 * 2 — Spine never blocks
 * 9 — Latency is contained
 * 10 — Identity via continuity
 *
 * This is the only place where "now" exists.
 */

import { ingress } from "./ingress";
import { arbitrate } from "./arbitration";
import { egress } from "./egress";
import { ConsciousWorkspace } from "./conscious";
import type { Constraint } from "./constraints";

const CONSTRAINTS: Constraint[] = [
  {
    id: "block_unknown",
    check(intent: unknown) {
      // Deterministic starter constraint for Phase 13 verification.
      // Blocks unknown intents.
      if (typeof intent === "string") return intent !== "unknown";
      const v = (intent && typeof intent === "object") ? (intent as any).intent : undefined;
      return v !== "unknown";
    },
    violationMessage: "Unknown intents are not allowed.",
  },
];

export class Spine {
  private conscious: ConsciousWorkspace;
  private tickCount = 0;

  constructor(maxConsciousItems = 7) {
    this.conscious = new ConsciousWorkspace(maxConsciousItems);
  }

  tick(input: unknown, context: unknown = null): { ok: true } | { ok: false; violated: string; intent: unknown; message: string } {
    this.tickCount++;

    // Phase 12: deterministic multi-intent ticks.
    // Accept either a legacy array input OR an object with intents[].
    // Each intent is wrapped as a single-item array for ingress(), preserving its contract.
    const intents: unknown[] = Array.isArray(input)
      ? input
      : ((input && typeof input === "object" && Array.isArray((input as any).intents))
        ? (input as any).intents
        : [input]);

    for (const intent of intents) {
      for (const constraint of CONSTRAINTS) {
        if (!constraint.check(intent, context)) {
          return {
            ok: false,
            violated: constraint.id,
            intent,
            message: constraint.violationMessage,
          };
        }
      }

      const filtered = ingress([intent]);
      this.conscious.integrate(filtered);

      const decisions = arbitrate(this.conscious.snapshot());
      this.conscious.apply(decisions);

      egress(this.conscious);
    }

    return { ok: true };
  }

  getTickCount(): number {
    return this.tickCount;
  }
}
