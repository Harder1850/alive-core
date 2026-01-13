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

  if (text.startsWith("delete file ")) {
    return { type: "DELETE_FILE", value: text.replace("delete file ", "") };
  }

  if (text.startsWith("confirm delete ")) {
    return { type: "CONFIRM_DELETE", value: text.replace("confirm delete ", "") };
  }

  if (text.startsWith("search file ")) {
    return { type: "SEARCH_FILES", value: text.replace("search file ", "") };
  }

  if (text.startsWith("trust delete ")) {
    return { type: "TRUST_DELETE", value: text.replace("trust delete ", "") };
  }

  if (text.startsWith("copy ")) {
    return { type: "COPY", value: input.slice(5) };
  }

  if (text === "paste") {
    return { type: "PASTE" };
  }

  if (text === "enable notifications") {
    return { type: "ENABLE_NOTIFICATIONS" };
  }

  if (text === "disable notifications") {
    return { type: "DISABLE_NOTIFICATIONS" };
  }

  if (text === "what do you remember") {
    return { type: "RECALL" };
  }

  return { type: "UNKNOWN", value: input };
}
