// experience/narrative.js

export function getStatistics(events) {
  const byType = {};
  const bySource = {};
  for (const e of events) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    bySource[e.source] = (bySource[e.source] || 0) + 1;
  }
  return { count: events.length, byType, bySource };
}

export function summarizeSegment(segment) {
  const { events, start, end } = segment;
  const stats = getStatistics(events);

  // keep it dumb & deterministic (no model calls here)
  return {
    start,
    end,
    count: stats.count,
    byType: stats.byType,
    bySource: stats.bySource,
    headline: `Segment: ${stats.count} events`,
  };
}

export function buildBriefSummary(segments) {
  if (!segments.length) return "No recent experience.";
  const last = segments[segments.length - 1];
  const s = summarizeSegment(last);
  return `Recent: ${s.count} events. Types: ${Object.keys(s.byType).join(", ") || "none"}.`;
}

export function buildNarrative(segments) {
  if (!segments.length) return "No experience recorded yet.";
  const lines = [];
  for (const seg of segments) {
    const s = summarizeSegment(seg);
    lines.push(`[${new Date(s.start).toLocaleString()}] ${s.headline}`);
    lines.push(`  types=${JSON.stringify(s.byType)} sources=${JSON.stringify(s.bySource)}`);
  }
  return lines.join("\n");
}

export function attachSummaries(segments) {
  return segments.map(seg => ({ ...seg, summary: summarizeSegment(seg) }));
}

