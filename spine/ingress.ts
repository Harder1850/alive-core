export function ingress(input: unknown[]): any[] {
  // placeholder: drop nulls, cap volume
  return input.filter(Boolean).slice(0, 10);
}
