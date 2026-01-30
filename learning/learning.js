/**
 * ALIVE Learning Mechanism
 * 
 * Extracts patterns from experience. Gets smarter over time.
 * 
 * Principle: Experience → Pattern → Knowledge
 * 
 * What worked? What didn't? Update for next time.
 * Share with swarm.
 */

import { writeFile, readFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

export const Learning = {

  // Experience log (append-only)
  experienceLog: [],

  // Extracted patterns
  patterns: new Map(),

  // Storage path
  storagePath: null,

  // === INITIALIZATION ===

  init: async function(storagePath) {
    this.storagePath = storagePath;
    
    await mkdir(join(storagePath, 'experience'), { recursive: true });
    await mkdir(join(storagePath, 'patterns'), { recursive: true });
    
    // Load existing patterns
    await this._loadPatterns();
    
    console.log(`[Learning] Initialized. ${this.patterns.size} patterns loaded.`);
    return this;
  },

  // === RECORD EXPERIENCE ===

  /**
   * Record an experience (situation + action + outcome)
   */
  record: async function(experience) {
    const entry = {
      id: this._generateId(),
      timestamp: Date.now(),
      
      // What was the situation?
      situation: {
        context: experience.context,
        swot: experience.swot,
        goal: experience.goal
      },
      
      // What did we do?
      action: {
        chosen: experience.action,
        alternatives: experience.alternatives || [],
        reasoningLevel: experience.reasoningLevel, // know/ask/observe/deduce/estimate/guess
        confidence: experience.confidence
      },
      
      // What happened?
      outcome: {
        success: experience.success,
        result: experience.result,
        unexpected: experience.unexpected || null,
        duration: experience.duration
      },
      
      // Tags for retrieval
      tags: experience.tags || []
    };

    // Append to log
    this.experienceLog.push(entry);

    // Persist
    await this._saveExperience(entry);

    // Trigger pattern extraction (async, don't wait)
    this._extractPatternsAsync(entry);

    return entry.id;
  },

  // === PATTERN EXTRACTION ===

  /**
   * Extract patterns from recent experiences
   */
  extractPatterns: async function(options = {}) {
    const { minOccurrences = 3, minConfidence = 0.6 } = options;
    
    const newPatterns = [];

    // Group experiences by situation type
    const grouped = this._groupBySituation(this.experienceLog);

    for (const [situationType, experiences] of Object.entries(grouped)) {
      if (experiences.length < minOccurrences) continue;

      // Find successful patterns
      const successes = experiences.filter(e => e.outcome.success);
      const failures = experiences.filter(e => !e.outcome.success);

      if (successes.length === 0) continue;

      // What actions led to success?
      const successActions = this._findCommonActions(successes);
      const failureActions = this._findCommonActions(failures);

      for (const action of successActions) {
        // Skip if also common in failures
        if (failureActions.includes(action)) continue;

        const successRate = successes.filter(e => e.action.chosen === action).length / experiences.length;
        
        if (successRate >= minConfidence) {
          const pattern = {
            id: this._generatePatternId(situationType, action),
            type: 'success_pattern',
            situation: situationType,
            action: action,
            confidence: successRate,
            occurrences: experiences.length,
            learned: Date.now(),
            source: 'experience'
          };

          newPatterns.push(pattern);
          this.patterns.set(pattern.id, pattern);
        }
      }

      // What to avoid?
      for (const action of failureActions) {
        if (successActions.includes(action)) continue;

        const failureRate = failures.filter(e => e.action.chosen === action).length / experiences.length;
        
        if (failureRate >= minConfidence) {
          const pattern = {
            id: this._generatePatternId(situationType, action),
            type: 'avoid_pattern',
            situation: situationType,
            action: action,
            confidence: failureRate,
            occurrences: experiences.length,
            learned: Date.now(),
            source: 'experience'
          };

          newPatterns.push(pattern);
          this.patterns.set(pattern.id, pattern);
        }
      }
    }

    // Save new patterns
    for (const pattern of newPatterns) {
      await this._savePattern(pattern);
    }

    console.log(`[Learning] Extracted ${newPatterns.length} new patterns`);
    return newPatterns;
  },

  // === QUERY PATTERNS ===

  /**
   * Get relevant patterns for a situation
   */
  getPatterns: function(situation) {
    const situationType = this._situationType(situation);
    const relevant = [];

    for (const pattern of this.patterns.values()) {
      if (pattern.situation === situationType || 
          this._situationMatches(pattern.situation, situationType)) {
        relevant.push(pattern);
      }
    }

    // Sort by confidence
    relevant.sort((a, b) => b.confidence - a.confidence);

    return {
      doThis: relevant.filter(p => p.type === 'success_pattern'),
      avoidThis: relevant.filter(p => p.type === 'avoid_pattern'),
      total: relevant.length
    };
  },

  /**
   * Check if action is recommended/discouraged
   */
  shouldDo: function(action, situation) {
    const patterns = this.getPatterns(situation);
    
    const recommend = patterns.doThis.find(p => p.action === action);
    const avoid = patterns.avoidThis.find(p => p.action === action);

    if (recommend && !avoid) {
      return { 
        verdict: 'recommended', 
        confidence: recommend.confidence,
        reason: 'success_pattern'
      };
    }
    
    if (avoid && !recommend) {
      return { 
        verdict: 'discouraged', 
        confidence: avoid.confidence,
        reason: 'avoid_pattern'
      };
    }

    if (recommend && avoid) {
      // Conflicting patterns - go with higher confidence
      if (recommend.confidence > avoid.confidence) {
        return { verdict: 'mixed_lean_yes', confidence: recommend.confidence - avoid.confidence };
      } else {
        return { verdict: 'mixed_lean_no', confidence: avoid.confidence - recommend.confidence };
      }
    }

    return { verdict: 'unknown', confidence: 0 };
  },

  // === SWARM SHARING ===

  /**
   * Export patterns for swarm sharing
   */
  exportForSwarm: function(minConfidence = 0.7) {
    const shareable = [];

    for (const pattern of this.patterns.values()) {
      if (pattern.confidence >= minConfidence) {
        shareable.push({
          ...pattern,
          sharedBy: 'self',
          sharedAt: Date.now()
        });
      }
    }

    return shareable;
  },

  /**
   * Import patterns from swarm
   */
  importFromSwarm: async function(patterns, source) {
    let imported = 0;

    for (const pattern of patterns) {
      // Check if we already have this pattern
      const existing = this.patterns.get(pattern.id);
      
      if (existing) {
        // Merge: increase confidence if confirmed by swarm
        existing.confidence = Math.min(1, existing.confidence + 0.1);
        existing.confirmedBy = existing.confirmedBy || [];
        existing.confirmedBy.push(source);
        await this._savePattern(existing);
      } else {
        // New pattern from swarm - reduce confidence initially
        const newPattern = {
          ...pattern,
          confidence: pattern.confidence * 0.7, // Trust but verify
          source: `swarm:${source}`,
          imported: Date.now()
        };
        this.patterns.set(newPattern.id, newPattern);
        await this._savePattern(newPattern);
        imported++;
      }
    }

    console.log(`[Learning] Imported ${imported} patterns from swarm`);
    return imported;
  },

  // === STATISTICS ===

  getStats: function() {
    const successPatterns = [...this.patterns.values()].filter(p => p.type === 'success_pattern');
    const avoidPatterns = [...this.patterns.values()].filter(p => p.type === 'avoid_pattern');

    return {
      experiences: this.experienceLog.length,
      patterns: this.patterns.size,
      successPatterns: successPatterns.length,
      avoidPatterns: avoidPatterns.length,
      avgConfidence: this.patterns.size > 0
        ? [...this.patterns.values()].reduce((sum, p) => sum + p.confidence, 0) / this.patterns.size
        : 0
    };
  },

  // === INTERNAL HELPERS ===

  _generateId: function() {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  },

  _generatePatternId: function(situation, action) {
    const hash = createHash('sha256')
      .update(`${situation}:${action}`)
      .digest('hex')
      .substring(0, 12);
    return `pat_${hash}`;
  },

  _situationType: function(situation) {
    // Create a normalized situation signature
    const parts = [];
    
    if (situation.context?.type) parts.push(situation.context.type);
    if (situation.goal?.type) parts.push(situation.goal.type);
    if (situation.swot?.threats?.length > 0) parts.push('has_threat');
    if (situation.swot?.opportunities?.length > 0) parts.push('has_opportunity');
    
    return parts.join(':') || 'general';
  },

  _situationMatches: function(patternSituation, currentSituation) {
    // Partial match - pattern situation is subset of current
    const patternParts = patternSituation.split(':');
    const currentParts = currentSituation.split(':');
    
    return patternParts.every(part => currentParts.includes(part));
  },

  _groupBySituation: function(experiences) {
    const groups = {};
    
    for (const exp of experiences) {
      const type = this._situationType(exp.situation);
      if (!groups[type]) groups[type] = [];
      groups[type].push(exp);
    }
    
    return groups;
  },

  _findCommonActions: function(experiences) {
    const counts = {};
    
    for (const exp of experiences) {
      const action = exp.action.chosen;
      counts[action] = (counts[action] || 0) + 1;
    }
    
    // Return actions that appear in >30% of experiences
    const threshold = experiences.length * 0.3;
    return Object.entries(counts)
      .filter(([_, count]) => count >= threshold)
      .map(([action]) => action);
  },

  _extractPatternsAsync: function(entry) {
    // Don't block on pattern extraction
    setTimeout(() => {
      if (this.experienceLog.length % 10 === 0) {
        this.extractPatterns().catch(err => {
          console.error('[Learning] Pattern extraction failed:', err.message);
        });
      }
    }, 100);
  },

  async _saveExperience(entry) {
    if (!this.storagePath) return;
    
    const date = new Date(entry.timestamp).toISOString().split('T')[0];
    const filePath = join(this.storagePath, 'experience', `${date}.jsonl`);
    
    await writeFile(filePath, JSON.stringify(entry) + '\n', { flag: 'a' });
  },

  async _savePattern(pattern) {
    if (!this.storagePath) return;
    
    const filePath = join(this.storagePath, 'patterns', `${pattern.id}.json`);
    await writeFile(filePath, JSON.stringify(pattern, null, 2));
  },

  async _loadPatterns() {
    if (!this.storagePath) return;
    
    const patternsDir = join(this.storagePath, 'patterns');
    
    try {
      await access(patternsDir);
      const { readdir } = await import('fs/promises');
      const files = await readdir(patternsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const data = await readFile(join(patternsDir, file), 'utf8');
            const pattern = JSON.parse(data);
            this.patterns.set(pattern.id, pattern);
          } catch (err) {
            // Skip invalid files
          }
        }
      }
    } catch (err) {
      // Directory doesn't exist yet
    }
  },

  // === RESET ===

  reset: function() {
    this.experienceLog = [];
    this.patterns.clear();
  }
};

export default Learning;
