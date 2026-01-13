// runtime/intents.js

export function parseIntent(input) {
  const text = input.toLowerCase().trim();

  if (text.startsWith("open ")) {
    return { type: "OPEN_APP", value: text.replace("open ", "") };
  }

  if (text.startsWith("list files")) {
    return { type: "LIST_FILES", value: "." };
  }

  if (text.startsWith("run ")) {
    return { type: "RUN_COMMAND", value: text.replace("run ", "") };
  }

  if (text.startsWith("remember ")) {
    return { type: "REMEMBER", value: text.replace("remember ", "") };
  }

  if (text === "what do you remember") {
    return { type: "RECALL" };
  }

  return { type: "UNKNOWN", value: input };
}

