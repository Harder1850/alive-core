// runtime/eventBus.js

/**
 * @typedef {{
 *   source: string,
 *   type: string,
 *   payload: any,
 *   importance?: number
 * }} QueuedEvent
 */

/** @type {QueuedEvent[]} */
const queue = [];

/** @param {QueuedEvent} e */
export function enqueueEvent(e) {
  queue.push(e);
}

export function drainEvents(max = 100) {
  return queue.splice(0, max);
}

