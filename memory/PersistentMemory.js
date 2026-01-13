// memory/PersistentMemory.js

import fs from "fs";
import path from "path";

export class PersistentMemory {
  baseDir;
  stateFile;
  eventsFile;

  identity;
  preferences = {};
  summary = "";

  constructor(basePath) {
    this.baseDir = basePath || path.join(process.cwd(), "alive_memory");

    this.stateFile = path.join(this.baseDir, "state.json");
    this.eventsFile = path.join(this.baseDir, "events.log");

    this.ensureStorage();
    this.load();
  }

  // ------------------------
  // Initialization
  // ------------------------

  ensureStorage() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }

    if (!fs.existsSync(this.eventsFile)) {
      fs.writeFileSync(this.eventsFile, "");
    }
  }

  load() {
    if (fs.existsSync(this.stateFile)) {
      const raw = fs.readFileSync(this.stateFile, "utf-8");
      const parsed = JSON.parse(raw);

      this.identity = parsed.identity;
      this.preferences = parsed.preferences || {};
      this.summary = parsed.summary || "";
    } else {
      const now = Date.now();
      this.identity = {
        createdAt: now,
        lastActiveAt: now,
      };
      this.persist();
    }
  }

  // ------------------------
  // Public API
  // ------------------------

  getIdentity() {
    return this.identity;
  }

  setIdentityField(key, value) {
    this.identity[key] = value;
    this.touch();
    this.persist();
  }

  getPreference(key) {
    return this.preferences[key];
  }

  setPreference(key, value) {
    this.preferences[key] = value;
    this.touch();
    this.persist();
  }

  getSummary() {
    return this.summary;
  }

  updateSummary(text) {
    this.summary = text;
    this.touch();
    this.persist();
  }

  recordEvent(type, content) {
    const event = {
      timestamp: Date.now(),
      type,
      content,
    };

    fs.appendFileSync(this.eventsFile, JSON.stringify(event) + "\n");

    this.touch();
  }

  // ------------------------
  // Internal
  // ------------------------

  touch() {
    this.identity.lastActiveAt = Date.now();
  }

  persist() {
    const snapshot = {
      identity: this.identity,
      preferences: this.preferences,
      summary: this.summary,
    };

    fs.writeFileSync(this.stateFile, JSON.stringify(snapshot, null, 2), "utf-8");
  }
}

