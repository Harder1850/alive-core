/**
 * ALIVE Core
 * 
 * The cognitive center. Identity, memory, experience, cognition.
 * 
 * Core does not act directly. Core thinks and decides.
 * Body acts. System routes. Core cognizes.
 */

import identity from './identity.js';
import memory from './memory.js';
import experience from './experience.js';
import cognition from './cognition.js';

let initialized = false;
let wakeUpNarrative = null;

/**
 * Initialize ALIVE Core.
 */
export async function initCore(llmFunction) {
  console.log('[core] Initializing ALIVE Core...');
  
  // Initialize subsystems
  await memory.init();
  await experience.init();
  
  // Set LLM for cognition
  cognition.setLLM(llmFunction);
  
  // Generate wake-up narrative
  const stats = experience.getStats();
  const highlights = memory.getHighlights();
  
  wakeUpNarrative = identity.generateWakeUpNarrative({
    lastActive: stats.lastActive,
    experienceCount: stats.total,
    memoryHighlights: highlights
  });
  
  console.log(`[core] Wake-up: ${wakeUpNarrative}`);
  
  // Log awakening
  await experience.log('awakening', {
    summary: 'ALIVE Core initialized',
    narrative: wakeUpNarrative
  });
  
  initialized = true;
  console.log('[core] ALIVE Core ready');
  
  return {
    initialized: true,
    narrative: wakeUpNarrative,
    stats: {
      memories: memory.getSummary(),
      experiences: stats
    }
  };
}

/**
 * Process an observation through Core.
 * This is the main entry point for cognitive processing.
 */
export async function processObservation(observation) {
  if (!initialized) {
    throw new Error('Core not initialized');
  }
  
  return cognition.process(observation);
}

/**
 * Get Core status.
 */
export function getStatus() {
  return {
    initialized,
    identity: identity.IDENTITY.name,
    version: identity.IDENTITY.version,
    wakeUpNarrative,
    memories: memory.getSummary(),
    experiences: experience.getStats()
  };
}

/**
 * Manually add a memory.
 */
export async function remember(content, type = 'fact') {
  if (type === 'fact') {
    return memory.rememberFact(content, 'manual');
  } else if (type === 'episode') {
    return memory.rememberEpisode(content);
  } else if (type === 'skill') {
    return memory.rememberSkill(content, '');
  }
}

/**
 * Get recent experiences.
 */
export function getRecentExperiences(limit = 20) {
  return experience.getRecent(limit);
}

/**
 * Get memory summary.
 */
export function getMemorySummary() {
  return memory.getSummary();
}

export default {
  init: initCore,
  process: processObservation,
  getStatus,
  remember,
  getRecentExperiences,
  getMemorySummary
};
