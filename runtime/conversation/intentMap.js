// runtime/conversation/intentMap.js

export const intentMap = [
  {
    intent: "system.wake",
    match: ["wake", "start", "hello", "hi"],
    handler: "wake"
  },
  {
    intent: "system.capabilities",
    match: ["what can you do", "capabilities", "abilities"],
    handler: "capabilities"
  },
  {
    intent: "system.remember",
    match: ["remember"],
    handler: "remember"
  },
  {
    intent: "system.recall",
    match: ["what do you remember", "recall", "do you remember"],
    handler: "recall"
  }
];

