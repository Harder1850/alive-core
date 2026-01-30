/**
 * ALIVE Continuous SWOT Assessment
 * 
 * SWOT isn't a meeting. SWOT is every moment.
 * 
 * Sensor input   → Updates SWOT
 * Action outcome → Updates SWOT
 * Swarm message  → Updates SWOT
 * Time passing   → Updates SWOT
 */

export const Assess = {

  // Current SWOT state
  current: {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  },

  // Thresholds for triggering replan
  thresholds: {
    newThreat: 0.7,
    opportunityWindow: 0.8,
    weaknessCritical: 0.9,
    strengthLost: 0.5
  },

  // === MAIN ANALYSIS ===
  analyze: function(situation) {
    return {
      strengths: this.assessStrengths(situation),
      weaknesses: this.assessWeaknesses(situation),
      opportunities: this.assessOpportunities(situation),
      threats: this.assessThreats(situation),
      timestamp: Date.now()
    };
  },

  // === STRENGTHS ===
  // What do I have working for me?
  assessStrengths: function(context) {
    const strengths = [];

    // Capabilities
    if (context.capabilities) {
      for (const cap of context.capabilities) {
        if (cap.available && cap.functional) {
          strengths.push({
            id: `cap_${cap.name}`,
            type: 'capability',
            description: cap.name,
            confidence: cap.reliability || 0.8
          });
        }
      }
    }

    // Resources
    if (context.resources) {
      for (const [resource, amount] of Object.entries(context.resources)) {
        if (amount > 0.5) { // Above 50%
          strengths.push({
            id: `res_${resource}`,
            type: 'resource',
            description: `${resource}: ${Math.round(amount * 100)}%`,
            confidence: 0.9
          });
        }
      }
    }

    // Knowledge
    if (context.knownArea) {
      strengths.push({
        id: 'known_terrain',
        type: 'knowledge',
        description: 'Familiar territory',
        confidence: 0.85
      });
    }

    // Swarm support
    if (context.swarmNearby && context.swarmNearby > 0) {
      strengths.push({
        id: 'swarm_support',
        type: 'social',
        description: `${context.swarmNearby} allies nearby`,
        confidence: 0.7
      });
    }

    return strengths;
  },

  // === WEAKNESSES ===
  // What's working against me?
  assessWeaknesses: function(context) {
    const weaknesses = [];

    // Low resources
    if (context.resources) {
      for (const [resource, amount] of Object.entries(context.resources)) {
        if (amount < 0.3) { // Below 30%
          weaknesses.push({
            id: `low_${resource}`,
            type: 'resource',
            description: `${resource}: ${Math.round(amount * 100)}%`,
            severity: 1 - amount,
            confidence: 0.9
          });
        }
      }
    }

    // Damaged capabilities
    if (context.capabilities) {
      for (const cap of context.capabilities) {
        if (cap.available && !cap.functional) {
          weaknesses.push({
            id: `damaged_${cap.name}`,
            type: 'capability',
            description: `${cap.name} damaged`,
            severity: 0.8,
            confidence: 0.9
          });
        }
      }
    }

    // Knowledge gaps
    if (context.unknownArea) {
      weaknesses.push({
        id: 'unknown_terrain',
        type: 'knowledge',
        description: 'Unfamiliar territory',
        severity: 0.6,
        confidence: 0.85
      });
    }

    // Time pressure
    if (context.deadline) {
      const remaining = context.deadline - Date.now();
      if (remaining < 60000) { // Less than 1 minute
        weaknesses.push({
          id: 'time_critical',
          type: 'constraint',
          description: 'Time running out',
          severity: 0.9,
          confidence: 1.0
        });
      }
    }

    return weaknesses;
  },

  // === OPPORTUNITIES ===
  // What can I exploit?
  assessOpportunities: function(context) {
    const opportunities = [];

    // Paths others missed
    if (context.alternateRoutes) {
      for (const route of context.alternateRoutes) {
        opportunities.push({
          id: `route_${route.id}`,
          type: 'path',
          description: route.description,
          value: route.advantage || 0.5,
          window: route.timeLimit || null,
          confidence: route.confidence || 0.6
        });
      }
    }

    // Help available
    if (context.helpOffered) {
      opportunities.push({
        id: 'help_available',
        type: 'social',
        description: 'Assistance offered',
        value: 0.7,
        confidence: 0.8
      });
    }

    // Environmental advantage
    if (context.environment) {
      if (context.environment.downhill) {
        opportunities.push({
          id: 'downhill',
          type: 'environment',
          description: 'Gravity assist',
          value: 0.3,
          confidence: 0.9
        });
      }
      if (context.environment.tailwind) {
        opportunities.push({
          id: 'tailwind',
          type: 'environment',
          description: 'Wind assist',
          value: 0.2,
          confidence: 0.8
        });
      }
    }

    // Learning potential
    if (context.novelSituation) {
      opportunities.push({
        id: 'learning',
        type: 'growth',
        description: 'New experience to learn from',
        value: 0.4,
        confidence: 0.9
      });
    }

    return opportunities;
  },

  // === THREATS ===
  // What can hurt me?
  assessThreats: function(context) {
    const threats = [];

    // Environmental hazards
    if (context.hazards) {
      for (const hazard of context.hazards) {
        threats.push({
          id: `hazard_${hazard.type}`,
          type: 'environment',
          description: hazard.description,
          severity: hazard.severity || 0.5,
          distance: hazard.distance,
          confidence: hazard.confidence || 0.7
        });
      }
    }

    // Hostile actors
    if (context.hostiles) {
      for (const hostile of context.hostiles) {
        threats.push({
          id: `hostile_${hostile.id}`,
          type: 'actor',
          description: hostile.description,
          severity: hostile.threat || 0.6,
          distance: hostile.distance,
          confidence: hostile.confidence || 0.7
        });
      }
    }

    // Resource depletion
    if (context.resources) {
      for (const [resource, amount] of Object.entries(context.resources)) {
        if (amount < 0.15) { // Below 15%
          threats.push({
            id: `depleting_${resource}`,
            type: 'resource',
            description: `${resource} nearly depleted`,
            severity: 0.85,
            confidence: 0.95
          });
        }
      }
    }

    // Deadline
    if (context.deadline) {
      const remaining = context.deadline - Date.now();
      if (remaining < 30000) { // Less than 30 seconds
        threats.push({
          id: 'deadline_imminent',
          type: 'constraint',
          description: 'Deadline imminent',
          severity: 0.95,
          confidence: 1.0
        });
      }
    }

    return threats;
  },

  // === UPDATE ===
  update: function(input) {
    const inputType = input.type;

    switch (inputType) {
      case 'sensor':
        this._updateFromSensor(input.data);
        break;
      case 'outcome':
        this._updateFromOutcome(input.data);
        break;
      case 'swarm':
        this._updateFromSwarm(input.data);
        break;
      case 'time':
        this._updateFromTime(input.data);
        break;
    }

    return this.current;
  },

  // === SHOULD REPLAN? ===
  shouldReplan: function() {
    // New threat above threshold?
    const criticalThreat = this.current.threats.find(
      t => t.severity > this.thresholds.newThreat
    );
    if (criticalThreat) return { replan: true, reason: 'critical_threat', trigger: criticalThreat };

    // Critical weakness?
    const criticalWeakness = this.current.weaknesses.find(
      w => w.severity > this.thresholds.weaknessCritical
    );
    if (criticalWeakness) return { replan: true, reason: 'critical_weakness', trigger: criticalWeakness };

    // Opportunity window closing?
    const closingOpp = this.current.opportunities.find(
      o => o.window && o.window < Date.now() + 10000 && o.value > this.thresholds.opportunityWindow
    );
    if (closingOpp) return { replan: true, reason: 'opportunity_closing', trigger: closingOpp };

    return { replan: false };
  },

  // === PRIORITY SORT ===
  priority: function() {
    // Critical threat > opportunity > weakness > optimization
    const all = [
      ...this.current.threats.map(t => ({ ...t, category: 'threat', priority: t.severity * 1.5 })),
      ...this.current.opportunities.map(o => ({ ...o, category: 'opportunity', priority: o.value * 1.2 })),
      ...this.current.weaknesses.map(w => ({ ...w, category: 'weakness', priority: w.severity })),
      ...this.current.strengths.map(s => ({ ...s, category: 'strength', priority: s.confidence * 0.5 }))
    ];

    return all.sort((a, b) => b.priority - a.priority);
  },

  // === INTERNAL UPDATES ===
  _updateFromSensor: function(data) {
    // Sensor data might reveal new threats or opportunities
    if (data.hazardDetected) {
      this.current.threats.push({
        id: `sensor_hazard_${Date.now()}`,
        type: 'environment',
        description: data.hazardDetected,
        severity: data.severity || 0.5,
        confidence: data.confidence || 0.7
      });
    }
  },

  _updateFromOutcome: function(data) {
    // Success confirms strength, failure reveals weakness
    if (data.success) {
      const existing = this.current.strengths.find(s => s.id === data.actionId);
      if (existing) {
        existing.confidence = Math.min(1, existing.confidence + 0.1);
      }
    } else {
      this.current.weaknesses.push({
        id: `failed_${data.actionId}`,
        type: 'capability',
        description: `${data.actionId} failed`,
        severity: 0.6,
        confidence: 0.9
      });
    }
  },

  _updateFromSwarm: function(data) {
    // Swarm intel updates opportunities and threats
    if (data.hazardReport) {
      this.current.threats.push({
        id: `swarm_hazard_${Date.now()}`,
        type: 'swarm_intel',
        description: data.hazardReport,
        severity: data.severity || 0.5,
        confidence: data.confidence || 0.6
      });
    }
    if (data.pathFound) {
      this.current.opportunities.push({
        id: `swarm_path_${Date.now()}`,
        type: 'path',
        description: data.pathFound,
        value: 0.7,
        confidence: data.confidence || 0.7
      });
    }
  },

  _updateFromTime: function(data) {
    // Time passing might make opportunities expire or threats grow
    this.current.opportunities = this.current.opportunities.filter(o => {
      if (o.window && o.window < Date.now()) {
        return false; // Expired
      }
      return true;
    });
  }
};

export default Assess;
