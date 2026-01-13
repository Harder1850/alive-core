// goals/types.js

/**
 * @typedef {'active'|'paused'|'blocked'|'complete'} GoalStatus
 * @typedef {{
 *   id: string,
 *   description: string,
 *   intent: string,
 *   priority: number,
 *   status: GoalStatus,
 *   created_at: number,
 *   last_updated: number,
 *   last_progress_note?: string,
 *   next_possible_action?: string,
 *   dependencies: string[]
 * }} Goal
 */

export {};

