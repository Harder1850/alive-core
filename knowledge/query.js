/**
 * ALIVE Knowledge Query
 * 
 * Searches converted knowledge stacks.
 * Works with output from convert.js
 * 
 * Query modes:
 * - urgent: fast, science only
 * - fast: science + governance
 * - normal: all stacks
 * - deep: all stacks, exhaustive
 */

import { readFile, readdir, access } from 'fs/promises';
import { join } from 'path';

export class KnowledgeQuery {
  
  constructor(knowledgeDir) {
    this.knowledgeDir = knowledgeDir;
    this.indexes = {};
    this.loaded = false;
  }

  /**
   * Load all stack indexes
   */
  async load() {
    const stacks = ['science', 'governance', 'language', 'cognition', 'aesthetics'];
    
    for (const stack of stacks) {
      const indexPath = join(this.knowledgeDir, stack, 'index.json');
      
      try {
        await access(indexPath);
        const data = await readFile(indexPath, 'utf8');
        this.indexes[stack] = JSON.parse(data);
      } catch (err) {
        console.warn(`[Knowledge] Stack '${stack}' not found or empty`);
        this.indexes[stack] = { documents: [], keywords: {} };
      }
    }
    
    this.loaded = true;
    console.log(`[Knowledge] Loaded ${Object.keys(this.indexes).length} stacks`);
    return this;
  }

  /**
   * Query knowledge stacks
   */
  async query(question, options = {}) {
    if (!this.loaded) await this.load();

    const {
      mode = 'normal',
      maxResults = 5,
      minScore = 0.1
    } = options;

    // Select stacks based on mode
    const targetStacks = this._getStacksForMode(mode);
    
    // Extract query terms
    const terms = this._extractTerms(question);
    
    // Search each stack
    const results = [];
    
    for (const stack of targetStacks) {
      const stackResults = await this._searchStack(stack, terms, maxResults);
      results.push(...stackResults);
    }
    
    // Sort by score and limit
    results.sort((a, b) => b.score - a.score);
    const filtered = results.filter(r => r.score >= minScore).slice(0, maxResults);
    
    return {
      query: question,
      terms,
      mode,
      results: filtered,
      totalMatches: results.length,
      stacks: targetStacks
    };
  }

  /**
   * Get specific document by ID
   */
  async getDocument(docId) {
    if (!this.loaded) await this.load();

    for (const [stack, index] of Object.entries(this.indexes)) {
      const doc = index.documents.find(d => d.id === docId);
      if (doc) {
        // Load full metadata
        const metaPath = join(this.knowledgeDir, stack, `${docId}.meta.json`);
        const chunksPath = join(this.knowledgeDir, stack, `${docId}.chunks.json`);
        
        try {
          const meta = JSON.parse(await readFile(metaPath, 'utf8'));
          const chunks = JSON.parse(await readFile(chunksPath, 'utf8'));
          
          return {
            ...meta,
            stack,
            chunks
          };
        } catch (err) {
          return { ...doc, stack, error: 'chunks_not_found' };
        }
      }
    }
    
    return null;
  }

  /**
   * Get chunk content by chunk ID
   */
  async getChunk(chunkId) {
    // chunkId format: doc_xxx_N
    const parts = chunkId.split('_');
    if (parts.length < 3) return null;
    
    const docId = parts.slice(0, 2).join('_');
    const chunkIndex = parseInt(parts[2]);
    
    const doc = await this.getDocument(docId);
    if (!doc || !doc.chunks) return null;
    
    return doc.chunks.find(c => c.index === chunkIndex) || null;
  }

  /**
   * Get stats about loaded knowledge
   */
  getStats() {
    const stats = {
      loaded: this.loaded,
      stacks: {}
    };
    
    for (const [stack, index] of Object.entries(this.indexes)) {
      stats.stacks[stack] = {
        documents: index.documentCount || index.documents?.length || 0,
        keywords: Object.keys(index.keywords || {}).length
      };
    }
    
    return stats;
  }

  // === Internal methods ===

  _getStacksForMode(mode) {
    switch (mode) {
      case 'urgent':
        return ['science'];
      case 'fast':
        return ['science', 'governance'];
      case 'deep':
        return ['science', 'governance', 'language', 'cognition', 'aesthetics'];
      case 'normal':
      default:
        return ['science', 'governance', 'cognition'];
    }
  }

  _extractTerms(question) {
    // Simple term extraction
    return question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2)
      .filter(t => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out'].includes(t));
  }

  async _searchStack(stack, terms, maxResults) {
    const index = this.indexes[stack];
    if (!index || !index.documents) return [];

    const results = [];
    const keywordIndex = index.keywords || {};

    // Find documents matching keywords
    const docScores = {};
    
    for (const term of terms) {
      // Exact keyword match
      if (keywordIndex[term]) {
        for (const docId of keywordIndex[term]) {
          docScores[docId] = (docScores[docId] || 0) + 2;
        }
      }
      
      // Partial keyword match
      for (const [keyword, docIds] of Object.entries(keywordIndex)) {
        if (keyword.includes(term) || term.includes(keyword)) {
          for (const docId of docIds) {
            docScores[docId] = (docScores[docId] || 0) + 1;
          }
        }
      }
    }

    // Convert to results with document info
    for (const [docId, score] of Object.entries(docScores)) {
      const doc = index.documents.find(d => d.id === docId);
      if (doc) {
        results.push({
          docId,
          title: doc.title,
          source: doc.source,
          stack,
          score: score / terms.length, // normalize
          chunkCount: doc.chunkCount
        });
      }
    }

    // If no keyword matches, search document titles
    if (results.length === 0) {
      for (const doc of index.documents) {
        const titleLower = (doc.title || '').toLowerCase();
        let titleScore = 0;
        
        for (const term of terms) {
          if (titleLower.includes(term)) {
            titleScore += 0.5;
          }
        }
        
        if (titleScore > 0) {
          results.push({
            docId: doc.id,
            title: doc.title,
            source: doc.source,
            stack,
            score: titleScore / terms.length,
            chunkCount: doc.chunkCount
          });
        }
      }
    }

    return results.slice(0, maxResults);
  }
}

/**
 * Quick query function (creates temporary instance)
 */
export async function quickQuery(knowledgeDir, question, options = {}) {
  const kq = new KnowledgeQuery(knowledgeDir);
  await kq.load();
  return kq.query(question, options);
}

export default KnowledgeQuery;
