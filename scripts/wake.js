#!/usr/bin/env node
/**
 * scripts/wake.js
 *
 * One-command demo runner.
 * Initializes runtime and performs wake-up narration.
 */

import { initializeRecorder } from "../experience/recorder.js";
import { wakeUp } from "../runtime/wakeup.js";

initializeRecorder({ dataDir: ".alive-data" });
wakeUp();

