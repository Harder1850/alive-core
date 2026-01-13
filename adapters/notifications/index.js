// adapters/notifications/index.js

import { exec } from "child_process";

export function notify(msg) {
  exec(
    `powershell -Command "if (Get-Module -ListAvailable BurntToast) { New-BurntToastNotification -Text 'ALIVE', '${msg}' }"`
  );
}

