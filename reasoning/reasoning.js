/**
 * ALIVE Reasoning Engine
 * 
 * ASSESS → SWOT (Strengths, Weaknesses, Opportunities, Threats)
 * ACT   → IAO (Improvise, Adapt, Overcome)
 * LEARN → Update, share, repeat
 */

import { Knowledge } from '../knowledge/knowledge.interface.js';
import { Assess } from './assess.js';

export const Reasoning = {

  // === REASONING HIERARCHY ===
  // Falls through until something works
  levels: ['know', 'ask', 'observe', 'deduce', 'estimate', 'guess'],

  // === MAIN DECISION FUNCTION ===
  decide: async function(situation, goal, options = {}) {
    const { urgency = 'normal', swarm = null } = options;

    // 1. ASSESS - SWOT analysis
    const swot = Assess.analyze(situation);

    // 2. REASON - try hierarchy until something works
    let answer = null;
    let level = null;

    for (const lvl of this.levels) {
      answer = await this[lvl](situation, swarm);
      if (answer) {
        level = lvl;
        break;
      }
    }

    // 3. PLAN - generate options using knowledge
    const options_list = await this._generateOptions(swot, goal, answer);

    // 4. EVALUATE - check each option
    const evaluated = await Promise.all(
      options_list.map(opt => this._evaluate(opt, swot, urgency))
    );

    // 5. DECIDE - pick best
    const decision = this._selectBest(evaluated, urgency);

    // 6. RETURN with IAO contingencies
    return {
      action: decision.action,
      confidence: decision.confidence,
      reasoningLevel: level,
      swot: swot,
      contingency: {
        improvise: decision.backup,
        adapt: decision.adaptations,
        overcome: decision.persistence
      },
      trace: decision.trace
    };
  },

  // === LEVEL 1: KNOW ===
  know: async function(situation, swarm) {
    const result = await Knowledge.query(situation, { mode: 'urgent' });
    if (result.results.length > 0 && result.results[0].confidence > 0.8) {
      return { level: 'know', answer: result.results[0], confidence: result.results[0].confidence };
    }
    return null;
  },

  // === LEVEL 2: ASK ===
  ask: async function(situation, swarm) {
    if (swarm && typeof swarm.request === 'function') {
      const swarmAnswer = await swarm.request(situation);
      if (swarmAnswer) {
        return { level: 'ask', answer: swarmAnswer, confidence: swarmAnswer.confidence || 0.7 };
      }
    }
    return null;
  },

  // === LEVEL 3: OBSERVE ===
  observe: function(situation, swarm) {
    // What are others doing in similar situations?
    if (situation.others && situation.others.length > 0) {
      const patterns = situation.others.map(o => o.action);
      const mostCommon = this._mostCommon(patterns);
      if (mostCommon) {
        return { level: 'observe', answer: mostCommon, confidence: 0.6 };
      }
    }
    return null;
  },

  // === LEVEL 4: DEDUCE ===
  deduce: async function(situation, swarm) {
    // Apply logic rules
    const physics = await Knowledge.canThis(situation.goal, situation.context);
    if (physics.feasible && physics.confidence > 0.7) {
      return { 
        level: 'deduce', 
        answer: { action: situation.goal, constraints: physics.constraints },
        confidence: physics.confidence * 0.9
      };
    }
    return null;
  },

  // === LEVEL 5: ESTIMATE ===
  estimate: function(situation, swarm) {
    // Partial information guess
    if (situation.partialData) {
      return {
        level: 'estimate',
        answer: this._interpolate(situation.partialData),
        confidence: 0.4
      };
    }
    return null;
  },

  // === LEVEL 6: GUESS ===
  guess: function(situation, swarm) {
    // Last resort - make a choice, then learn
    return {
      level: 'guess',
      answer: { action: 'try_default', note: 'will learn from outcome' },
      confidence: 0.2
    };
  },

  // === IAO: IMPROVISE ===
  improvise: function(resources, goal) {
    // Use what I have
    return {
      available: resources,
      needed: goal.requirements || [],
      substitutions: this._findSubstitutions(resources, goal),
      plan: 'use_available_resources'
    };
  },

  // === IAO: ADAPT ===
  adapt: function(failure, context) {
    // Change what's not working
    return {
      failed: failure.action,
      reason: failure.reason,
      alternatives: this._generateAlternatives(failure, context),
      adjustment: 'modify_approach'
    };
  },

  // === IAO: OVERCOME ===
  overcome: function(obstacle, goal) {
    // Keep going until done
    return {
      obstacle: obstacle,
      goal: goal,
      persistence: true,
      strategies: ['retry', 'workaround', 'decompose', 'escalate']
    };
  },

  // === INTERNAL HELPERS ===

  _generateOptions: async function(swot, goal, priorAnswer) {
    const options = [];
    
    // Option from prior reasoning
    if (priorAnswer) {
      options.push({
        action: priorAnswer.answer.action || priorAnswer.answer,
        source: priorAnswer.level,
        confidence: priorAnswer.confidence
      });
    }

    // Options from strengths
    for (const strength of swot.strengths) {
      options.push({
        action: `leverage_${strength.id}`,
        source: 'strength',
        confidence: strength.confidence
      });
    }

    // Options from opportunities
    for (const opp of swot.opportunities) {
      options.push({
        action: `exploit_${opp.id}`,
        source: 'opportunity',
        confidence: opp.confidence
      });
    }

    return options;
  },

  _evaluate: async function(option, swot, urgency) {
    // Check physics
    const physics = await Knowledge.canThis(option.action, {});
    if (!physics.feasible) {
      return { ...option, score: 0, reason: 'physics_impossible' };
    }

    // Check ethics
    const ethics = await Knowledge.shouldI(option.action, {});
    if (!ethics.permitted) {
      return { ...option, score: 0, reason: 'ethics_blocked' };
    }

    // Score based on confidence and urgency
    let score = option.confidence;
    if (urgency === 'critical') {
      score *= physics.confidence; // fast and certain
    } else {
      score *= (physics.confidence + ethics.confidence) / 2;
    }

    return {
      ...option,
      score,
      constraints: physics.constraints,
      risks: ethics.risks
    };
  },

  _selectBest: function(evaluated, urgency) {
    const sorted = evaluated.filter(e => e.score > 0).sort((a, b) => b.score - a.score);
    
    if (sorted.length === 0) {
      return {
        action: 'no_viable_option',
        confidence: 0,
        backup: null,
        adaptations: [],
        persistence: false,
        trace: 'all options failed evaluation'
      };
    }

    const best = sorted[0];
    const backup = sorted[1] || null;

    return {
      action: best.action,
      confidence: best.score,
      backup: backup ? backup.action : null,
      adaptations: sorted.slice(1, 4).map(s => s.action),
      persistence: true,
      trace: `selected ${best.action} (score: ${best.score.toFixed(2)})`
    };
  },

  _mostCommon: function(arr) {
    if (!arr || arr.length === 0) return null;
    const counts = {};
    arr.forEach(item => { counts[item] = (counts[item] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  },

  _interpolate: function(partialData) {
    // Simple interpolation placeholder
    return { interpolated: true, data: partialData };
  },

  _findSubstitutions: function(resources, goal) {
    // Placeholder for resource substitution logic
    return [];
  },

  _generateAlternatives: function(failure, context) {
    // Placeholder for alternative generation
    return [];
  }
};

export default Reasoning;
