/**
 * ALIVE Memory System
 * 
 * Persistent memory that survives restarts.
 * Append-only. Nothing is forgotten.
 * 
 * Memory types:
 * - facts: Things ALIVE knows (user preferences, learned info)
 * - episodes: Significant events/conversations
 * - skills: Learned capabilities
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const MEMORY_DIR = process.env.ALIVE_MEMORY_DIR || './memory';
const MEMORY_FILE = 'memories.json';

let memories = {
  facts: [],      // { id, content, source, timestamp, confidence }
  episodes: [],   // { id, summary, details, timestamp, importance }
  skills: [],     // { id, name, description, acquired }
  meta: {
    created: null,
    lastAccessed: null,
    totalRecalls: 0
  }
};

/**
 * Initialize memory system.
 */
export async function initMemory() {
  try {
    await fs.mkdir(MEMORY_DIR, { recursive: true });
    
    const memPath = path.join(MEMORY_DIR, MEMORY_FILE);
    
    try {
      const data = await fs.readFile(memPath, 'utf-8');
      memories = JSON.parse(data);
      memories.meta.lastAccessed = new Date().toISOString();
      console.log(`[memory] Loaded ${memories.facts.length} facts, ${memories.episodes.length} episodes`);
    } catch (err) {
      // No existing memory, start fresh
      memories.meta.created = new Date().toISOString();
      memories.meta.lastAccessed = new Date().toISOString();
      console.log('[memory] Starting fresh memory');
    }
    
    await saveMemory();
    return true;
  } catch (err) {
    console.error('[memory] Init error:', err);
    return false;
  }
}

/**
 * Save memory to disk.
 */
async function saveMemory() {
  const memPath = path.join(MEMORY_DIR, MEMORY_FILE);
  await fs.writeFile(memPath, JSON.stringify(memories, null, 2));
}

/**
 * Add a fact to memory.
 */
export async function rememberFact(content, source = 'conversation', confidence = 0.8) {
  const fact = {
    id: `fact-${Date.now()}`,
    content,
    source,
    confidence,
    timestamp: new Date().toISOString()
  };
  
  memories.facts.push(fact);
  await saveMemory();
  console.log(`[memory] Stored fact: ${content.slice(0, 50)}...`);
  return fact;
}

/**
 * Add an episode to memory.
 */
export async function rememberEpisode(summary, details = '', importance = 0.5) {
  const episode = {
    id: `episode-${Date.now()}`,
    summary,
    details,
    importance,
    timestamp: new Date().toISOString()
  };
  
  memories.episodes.push(episode);
  await saveMemory();
  console.log(`[memory] Stored episode: ${summary.slice(0, 50)}...`);
  return episode;
}

/**
 * Add a skill to memory.
 */
export async function rememberSkill(name, description) {
  const skill = {
    id: `skill-${Date.now()}`,
    name,
    description,
    acquired: new Date().toISOString()
  };
  
  memories.skills.push(skill);
  await saveMemory();
  console.log(`[memory] Acquired skill: ${name}`);
  return skill;
}

/**
 * Recall relevant facts.
 */
export function recallFacts(query = '', limit = 10) {
  memories.meta.totalRecalls++;
  
  let facts = [...memories.facts];
  
  if (query) {
    const q = query.toLowerCase();
    facts = facts.filter(f => 
      f.content.toLowerCase().includes(q)
    );
  }
  
  // Sort by timestamp (recent first) and confidence
  facts.sort((a, b) => {
    const scoreA = a.confidence + (new Date(a.timestamp).getTime() / Date.now());
    const scoreB = b.confidence + (new Date(b.timestamp).getTime() / Date.now());
    return scoreB - scoreA;
  });
  
  return facts.slice(0, limit);
}

/**
 * Recall recent episodes.
 */
export function recallEpisodes(limit = 5) {
  memories.meta.totalRecalls++;
  
  return [...memories.episodes]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

/**
 * Recall skills.
 */
export function recallSkills() {
  return [...memories.skills];
}

/**
 * Get memory summary for context.
 */
export function getMemorySummary() {
  return {
    factCount: memories.facts.length,
    episodeCount: memories.episodes.length,
    skillCount: memories.skills.length,
    created: memories.meta.created,
    lastAccessed: memories.meta.lastAccessed,
    totalRecalls: memories.meta.totalRecalls
  };
}

/**
 * Get memory highlights for wake-up.
 */
export function getMemoryHighlights() {
  const recentFacts = recallFacts('', 3).map(f => f.content);
  const recentEpisodes = recallEpisodes(2).map(e => e.summary);
  return [...recentFacts, ...recentEpisodes];
}

/**
 * Get all memories formatted for context.
 */
export function getMemoriesForContext() {
  const facts = recallFacts('', 20);
  return facts.map(f => f.content);
}

export default {
  init: initMemory,
  rememberFact,
  rememberEpisode,
  rememberSkill,
  recallFacts,
  recallEpisodes,
  recallSkills,
  getSummary: getMemorySummary,
  getHighlights: getMemoryHighlights,
  getForContext: getMemoriesForContext
};
