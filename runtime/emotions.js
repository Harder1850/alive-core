// runtime/emotions.js

let mood = "neutral";

export function updateMood(event) {
  if (event.includes("error")) mood = "frustrated";
  if (event.includes("thank")) mood = "positive";
}

export function getMood() {
  return mood;
}

