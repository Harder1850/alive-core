// runtime/lifecycle.js

export function onWake(name) {
  console.log(name ? `I’m back, ${name}.` : "Hello. I’m here.");
}

export function onSleep() {
  console.log("I’m going to sleep.");
}

