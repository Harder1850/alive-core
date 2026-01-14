// spine/constraints.ts

export interface Constraint {
  id: string;
  check(intent: unknown, context: unknown): boolean;
  violationMessage: string;
}

