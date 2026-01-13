// preferences/types.js
// Types, schemas, enums, validators only.
//
// ❌ No file IO
// ❌ No persistence
// ❌ No defaults that imply policy
// ❌ No imports from /spine

/**
 * @typedef {'string'|'number'|'boolean'|'json'} PreferenceValueType
 * @typedef {{
 *   key: string,
 *   description?: string,
 *   valueType: PreferenceValueType,
 *   tags?: string[],
 *   metadata?: Record<string, unknown>
 * }} PreferenceDefinition
 */

/**
 * @typedef {{
 *   key: string,
 *   value: unknown,
 *   updated_at: number
 * }} PreferenceEntry
 */

export const PREFERENCE_VALUE_TYPES = ["string", "number", "boolean", "json"];

/** @param {unknown} x */
export function isPreferenceValueType(x) {
  return typeof x === "string" && PREFERENCE_VALUE_TYPES.includes(x);
}

/** @param {unknown} x */
export function isPreferenceDefinition(x) {
  if (!x || typeof x !== "object") return false;
  const d = /** @type {any} */ (x);
  if (typeof d.key !== "string" || !d.key.trim()) return false;
  if (!isPreferenceValueType(d.valueType)) return false;
  return true;
}

/**
 * Validate a preference value against an expected type.
 * This is a simple shape/type check only; it does not enforce policy.
 *
 * @param {unknown} value
 * @param {PreferenceValueType} valueType
 */
export function validatePreferenceValue(value, valueType) {
  switch (valueType) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "boolean":
      return typeof value === "boolean";
    case "json":
      // Any JSON-serializable value is acceptable; we keep this permissive.
      try {
        JSON.stringify(value);
        return true;
      } catch {
        return false;
      }
    default:
      return false;
  }
}

/** @param {unknown} x */
export function isPreferenceEntry(x) {
  if (!x || typeof x !== "object") return false;
  const e = /** @type {any} */ (x);
  if (typeof e.key !== "string" || !e.key.trim()) return false;
  if (typeof e.updated_at !== "number") return false;
  return true;
}

