/**
 * Experience logging entrypoint (Body-side).
 * MUST be append-only in spirit; implementation can come later.
 */
export function recordExperience(evt) {
  // Placeholder: for now just emit to console so nothing is hidden.
  // Replace with append-only logging implementation later.
  console.log("[body.experience]", JSON.stringify(evt));
}

