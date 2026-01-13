// experience/stream.js

import fs from "node:fs";
import { getEventsFilePath, isInitialized } from "./recorder.js";

function ensureInit() {
  if (!isInitialized()) throw new Error("experience recorder not initialized");
}

export function loadAllEvents() {
  ensureInit();
  const p = getEventsFilePath();
  const txt = fs.readFileSync(p, "utf8");
  if (!txt.trim()) return [];
  return txt
    .split("\n")
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

export function getEventCount() {
  return loadAllEvents().length;
}

export function getFirstEventTimestamp() {
  const evts = loadAllEvents();
  return evts.length ? evts[0].timestamp : null;
}

export function getLastEventTimestamp() {
  const evts = loadAllEvents();
  return evts.length ? evts[evts.length - 1].timestamp : null;
}

export function getEventsSince(ts) {
  return loadAllEvents().filter(e => e.timestamp >= ts);
}

export function getEventsInRange(start, end) {
  return loadAllEvents().filter(e => e.timestamp >= start && e.timestamp <= end);
}

export function getEventsBySource(source) {
  return loadAllEvents().filter(e => e.source === source);
}

export function getEventsByType(type) {
  return loadAllEvents().filter(e => e.type === type);
}

// Segment by time window (ms)
export function segmentEvents(events, windowMs = 60_000) {
  if (!events.length) return [];
  const segments = [];
  let current = [events[0]];
  let startTs = events[0].timestamp;

  for (let i = 1; i < events.length; i++) {
    const e = events[i];
    if (e.timestamp - startTs <= windowMs) {
      current.push(e);
    } else {
      segments.push({ start: startTs, end: current[current.length - 1].timestamp, events: current });
      current = [e];
      startTs = e.timestamp;
    }
  }
  segments.push({ start: startTs, end: current[current.length - 1].timestamp, events: current });
  return segments;
}

export function getRecentSegments({ windowMs = 60_000, count = 5 } = {}) {
  const evts = loadAllEvents();
  const segs = segmentEvents(evts, windowMs);
  return segs.slice(-count);
}

