/**
 * Pre-conscious filtering
 *
 * Invariants:
 * 4 — All information is filtered on entry
 */

export function ingress(input: unknown[]): any[] {
  // placeholder: drop nulls, cap volume
  return input.filter(Boolean).slice(0, 10);
}
