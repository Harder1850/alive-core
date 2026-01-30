/**
 * ALIVE Cognition
 * 
 * THE SINGLE COGNITIVE LOOP.
 * 
 * All thinking flows through here. This is where ALIVE:
 * - Perceives (interprets observations)
 * - Remembers (recalls relevant context)
 * - Thinks (consults LLM with full context)
 * - Decides (determines response/action)
 * - Learns (forms new memories from experience)
 */

import { getSystemPrompt } from './identity.js';
import memory from './memory.js';
import experience from './experience.js';

// LLM function will be injected
let llmFunction = null;

/**
 * Set the LLM function.
 * Core consults LLMs; it doesn't depend on a specific one.
 */
export function setLLM(fn) {
  llmFunction = fn;
}

/**
 * Process an observation through the cognitive loop.
 * Returns a response/decision.
 */
export async function processObservation(observation) {
  const startTime = Date.now();
  
  // 1. LOG: Record the observation
  await experience.logObservation(observation);
  
  // 2. PERCEIVE: What is this observation?
  const perception = perceive(observation);
  console.log(`[cognition] Perceived: ${perception.type}`);
  
  // 3. REMEMBER: What's relevant from memory?
  const context = remember(perception);
  console.log(`[cognition] Recalled ${context.memories.length} memories`);
  
  // 4. THINK: Consult LLM with full context
  const thought = await think(perception, context);
  
  // 5. DECIDE: What should we do/say?
  const decision = decide(thought, perception);
  await experience.logDecision(decision.action, decision.reasoning);
  
  // 6. LEARN: Should we remember anything?
  await learn(observation, thought, decision);
  
  // 7. LOG: Record the response
  const processingTime = Date.now() - startTime;
  await experience.logResponse(decision.response, processingTime);
  
  console.log(`[cognition] Processed in ${processingTime}ms`);
  
  return decision;
}

/**
 * PERCEIVE: Interpret the observation.
 */
function perceive(observation) {
  const { modality, raw } = observation;
  
  const perception = {
    type: modality,
    content: raw,
    isQuestion: false,
    isCommand: false,
    isGreeting: false,
    topics: []
  };
  
  if (typeof raw === 'string') {
    const text = raw.toLowerCase();
    
    // Detect question
    perception.isQuestion = text.includes('?') || 
      text.startsWith('what') || 
      text.startsWith('how') || 
      text.startsWith('why') ||
      text.startsWith('when') ||
      text.startsWith('who') ||
      text.startsWith('can you');
    
    // Detect command/action request
    perception.isCommand = 
      text.startsWith('build') ||
      text.startsWith('create') ||
      text.startsWith('make') ||
      text.startsWith('write') ||
      text.startsWith('update') ||
      text.startsWith('delete') ||
      text.startsWith('show') ||
      text.startsWith('list');
    
    // Detect greeting
    perception.isGreeting = 
      text.startsWith('hello') ||
      text.startsWith('hi') ||
      text.startsWith('hey') ||
      text === 'hi' ||
      text === 'hello';
    
    // Extract topics (simple keyword extraction)
    const keywords = text.match(/\b[a-z]{4,}\b/g) || [];
    perception.topics = [...new Set(keywords)].slice(0, 5);
  }
  
  return perception;
}

/**
 * REMEMBER: Recall relevant context.
 */
function remember(perception) {
  // Get relevant memories based on topics
  let relevantMemories = [];
  
  for (const topic of perception.topics) {
    const topicMemories = memory.recallFacts(topic, 3);
    relevantMemories.push(...topicMemories);
  }
  
  // Also get recent memories
  const recentMemories = memory.recallFacts('', 5);
  relevantMemories.push(...recentMemories);
  
  // Deduplicate
  const seen = new Set();
  relevantMemories = relevantMemories.filter(m => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
  
  // Get recent experiences
  const recentExperiences = experience.getRecent(10);
  
  return {
    memories: relevantMemories.map(m => m.content),
    recentExperience: recentExperiences
  };
}

/**
 * THINK: Consult LLM with full context.
 */
async function think(perception, context) {
  if (!llmFunction) {
    return {
      success: false,
      content: 'No LLM configured',
      error: 'LLM function not set'
    };
  }
  
  // Build system prompt with context
  const systemPrompt = getSystemPrompt({
    memory: context.memories,
    recentExperience: context.recentExperience
  });
  
  // Call LLM
  const response = await llmFunction(perception.content, {
    system: systemPrompt
  });
  
  return response;
}

/**
 * DECIDE: Determine response/action.
 */
function decide(thought, perception) {
  // If LLM call failed, provide fallback
  if (!thought.success) {
    return {
      action: 'respond',
      response: `I encountered an issue: ${thought.error}. Let me try a different approach.`,
      reasoning: 'LLM call failed, providing error message'
    };
  }
  
  return {
    action: perception.isCommand ? 'act' : 'respond',
    response: thought.content,
    reasoning: perception.isCommand 
      ? 'User requested an action' 
      : 'User engaged in conversation'
  };
}

/**
 * LEARN: Form new memories from this experience.
 */
async function learn(observation, thought, decision) {
  const text = observation.raw;
  
  if (typeof text !== 'string') return;
  
  // Learn user preferences/facts
  const learnPatterns = [
    /my name is (\w+)/i,
    /i('m| am) (\w+)/i,
    /i work (?:at|for|on) (.+)/i,
    /i like (.+)/i,
    /i prefer (.+)/i,
    /remember that (.+)/i
  ];
  
  for (const pattern of learnPatterns) {
    const match = text.match(pattern);
    if (match) {
      const fact = match[0];
      await memory.rememberFact(fact, 'user_statement');
      await experience.logMemoryFormed('fact', fact);
      console.log(`[cognition] Learned: ${fact}`);
    }
  }
  
  // Log significant conversations as episodes
  if (text.length > 100 || decision.action === 'act') {
    await memory.rememberEpisode(
      `Conversation: ${text.slice(0, 50)}...`,
      `User: ${text}\nALIVE: ${decision.response.slice(0, 200)}`,
      0.5
    );
  }
}

export default {
  setLLM,
  process: processObservation
};
