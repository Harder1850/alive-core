/**
 * body.ts
 *
 * Body Interface Contract (Core-side)
 *
 * alive-core is frozen at Phase 27 and MUST NOT perform IO or execution.
 * This interface exists to define a boundary for external embodiment.
 *
 * The separation between alive-core and alive-body is a safety boundary, not an organizational choice.
 */

export interface BodyInterface {
  observe(input: unknown): void;
  report(event: unknown): void;
}

/**
 * A null-body implementation to ensure alive-core remains runnable with no body.
 */
export const NullBody: BodyInterface = {
  observe() {},
  report() {},
};

