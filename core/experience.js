/**
 * ALIVE Experience Stream
 * 
 * Append-only log of everything that happens.
 * This is the raw truth. Memory is derived from this.
 * 
 * Experiences are immutable. They can only be added, never modified or deleted.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const EXPERIENCE_DIR = process.env.ALIVE_EXPERIENCE_DIR || './experience';

let experienceBuffer = [];
let experienceCount = 0;
let lastActive = null;

/**
 * Initialize experience stream.
 */
export async function initExperience() {
  try {
    await fs.mkdir(EXPERIENCE_DIR, { recursive: true });
    
    // Count existing experiences
    const files = await fs.readdir(EXPERIENCE_DIR);
    const expFiles = files.filter(f => f.endsWith('.jsonl'));
    
    for (const file of expFiles) {
      const content = await fs.readFile(path.join(EXPERIENCE_DIR, file), 'utf-8');
      const lines = content.trim().split('\n').filter(l => l);
      experienceCount += lines.length;
      
      // Get last timestamp
      if (lines.length > 0) {
        try {
          const last = JSON.parse(lines[lines.length - 1]);
          if (!lastActive || new Date(last.timestamp) > new Date(lastActive)) {
            lastActive = last.timestamp;
          }
        } catch {}
      }
    }
    
    console.log(`[experience] Loaded ${experienceCount} experiences, last active: ${lastActive || 'never'}`);
    return true;
  } catch (err) {
    console.error('[experience] Init error:', err);
    return false;
  }
}

/**
 * Log an experience.
 */
export async function logExperience(type, data) {
  const experience = {
    id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    timestamp: new Date().toISOString(),
    ...data
  };
  
  // Add to buffer
  experienceBuffer.push(experience);
  experienceCount++;
  lastActive = experience.timestamp;
  
  // Write to disk
  await appendExperience(experience);
  
  console.log(`[experience] Logged: ${type}`);
  return experience;
}

/**
 * Append experience to file.
 */
async function appendExperience(experience) {
  const date = experience.timestamp.split('T')[0];
  const filename = `experiences-${date}.jsonl`;
  const filepath = path.join(EXPERIENCE_DIR, filename);
  
  await fs.appendFile(filepath, JSON.stringify(experience) + '\n');
}

/**
 * Log an observation received.
 */
export async function logObservation(observation) {
  return logExperience('observation', {
    summary: `Received ${observation.modality} observation`,
    modality: observation.modality,
    source: observation.source,
    rawPreview: typeof observation.raw === 'string' 
      ? observation.raw.slice(0, 200) 
      : '[non-text]'
  });
}

/**
 * Log a response generated.
 */
export async function logResponse(response, processingTime) {
  return logExperience('response', {
    summary: 'Generated response',
    preview: response.slice(0, 200),
    length: response.length,
    processingTime
  });
}

/**
 * Log a decision made.
 */
export async function logDecision(decision, reasoning) {
  return logExperience('decision', {
    summary: `Decision: ${decision}`,
    decision,
    reasoning
  });
}

/**
 * Log an action taken.
 */
export async function logAction(action, result) {
  return logExperience('action', {
    summary: `Action: ${action}`,
    action,
    result: result?.success ? 'success' : 'failed',
    details: result
  });
}

/**
 * Log a memory formation.
 */
export async function logMemoryFormed(memoryType, content) {
  return logExperience('memory_formed', {
    summary: `Formed ${memoryType} memory`,
    memoryType,
    contentPreview: content.slice(0, 100)
  });
}

/**
 * Get recent experiences.
 */
export function getRecentExperiences(limit = 20) {
  return experienceBuffer.slice(-limit);
}

/**
 * Get experience stats.
 */
export function getExperienceStats() {
  return {
    total: experienceCount,
    lastActive,
    bufferSize: experienceBuffer.length
  };
}

export default {
  init: initExperience,
  log: logExperience,
  logObservation,
  logResponse,
  logDecision,
  logAction,
  logMemoryFormed,
  getRecent: getRecentExperiences,
  getStats: getExperienceStats
};
