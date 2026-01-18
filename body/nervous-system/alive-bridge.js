/**
 * Brain bridge (firewalled).
 *
 * Brain–Body Bridge API (MANDATORY)
 *
 * Allowed Input Shape
 * {
 *   consultationId: string;
 *   observations: any[];
 *   environment: object;
 *   bodyState?: object;
 *   question?: string;
 *   timestamp: string; // ISO-8601
 * }
 *
 * Rules:
 * ❌ No functions
 * ❌ No callbacks
 * ❌ No tool handles
 * ❌ No commands
 * ❌ No schedules
 *
 * Allowed Output Shape
 * {
 *   consultationId: string;
 *   judgment: "allowed" | "disallowed" | "no-op" | "unknown";
 *   constraints: string[];
 *   explanation: string;
 *   timestamp: string; // ISO-8601
 * }
 *
 * Rules:
 * ❌ No imperatives
 * ❌ No plans
 * ❌ No steps
 * ❌ No actuator references
 */
export async function consultBrain(request) {
  if (!request || typeof request !== "object") {
    throw new Error("Invalid Brain consultation request");
  }

  return {
    consultationId: request.consultationId,
    judgment: "no-op",
    constraints: [],
    explanation: "Brain not yet connected. Descriptive placeholder.",
    timestamp: new Date().toISOString(),
  };
}
