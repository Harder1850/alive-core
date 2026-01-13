// services/voice/tts.js

import { exec } from "child_process";

export function speak(text) {
  exec(`powershell -Command "Add-Type –AssemblyName System.Speech; 
  (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('${text}')"`);
}

