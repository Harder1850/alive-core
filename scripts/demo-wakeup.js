import { initializeRecorder } from "../experience/recorder.js";
import { getRecentSegments } from "../experience/stream.js";
import { buildBriefSummary } from "../experience/narrative.js";

initializeRecorder({ dataDir: ".alive-data" });

const segments = getRecentSegments({ windowMs: 60_000, count: 5 });
console.log("I'm back. Here's what I remember:");
console.log(buildBriefSummary(segments));

