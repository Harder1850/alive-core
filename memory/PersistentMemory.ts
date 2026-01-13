// src/memory/PersistentMemory.ts

import fs from "fs";
import path from "path";

export interface IdentityState {
  name?: string;
  description?: string;
  createdAt: number;
  lastActiveAt: number;
}

export interface MemoryEvent {
  timestamp: number;
  type: string;
  content: string;
}

export interface MemorySnapshot {
  identity: IdentityState;
  preferences: Record<string, any>;
  summary: string;
}

export class PersistentMemory {
  private baseDir: string;
  private stateFile: string;
  private eventsFile: string;

  private identity!: IdentityState;
  private preferences: Record<string, any> = {};
  private summary: string = "";

  constructor(basePath?: string) {
    this.baseDir =
      basePath ||
      path.join(process.cwd(), "alive_memory");

    this.stateFile = path.join(this.baseDir, "state.json");
    this.eventsFile = path.join(this.baseDir, "events.log");

    this.ensureStorage();
    this.load();
  }

  // ------------------------
  // Initialization
  // ------------------------

  private ensureStorage() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }

    if (!fs.existsSync(this.eventsFile)) {
      fs.writeFileSync(this.eventsFile, "");
    }
  }

  private load() {
    if (fs.existsSync(this.stateFile)) {
      const raw = fs.readFileSync(this.stateFile, "utf-8");
      const parsed: MemorySnapshot = JSON.parse(raw);

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

  getIdentity(): IdentityState {
    return this.identity;
  }

  setIdentityField(key: keyof IdentityState, value: any) {
    (this.identity as any)[key] = value;
    this.touch();
    this.persist();
  }

  getPreference(key: string) {
    return this.preferences[key];
  }

  setPreference(key: string, value: any) {
    this.preferences[key] = value;
    this.touch();
    this.persist();
  }

  getSummary(): string {
    return this.summary;
  }

  updateSummary(text: string) {
    this.summary = text;
    this.touch();
    this.persist();
  }

  recordEvent(type: string, content: string) {
    const event: MemoryEvent = {
      timestamp: Date.now(),
      type,
      content,
    };

    fs.appendFileSync(
      this.eventsFile,
      JSON.stringify(event) + "\n"
    );

    this.touch();
  }

  // ------------------------
  // Internal
  // ------------------------

  private touch() {
    this.identity.lastActiveAt = Date.now();
  }

  private persist() {
    const snapshot: MemorySnapshot = {
      identity: this.identity,
      preferences: this.preferences,
      summary: this.summary,
    };

    fs.writeFileSync(
      this.stateFile,
      JSON.stringify(snapshot, null, 2),
      "utf-8"
    );
  }
}

