@echo off
echo Starting ALIVE...

REM Start ui-bridge (memory server)
start cmd /k "cd /d C:\Users\mikeh\dev\alive-system && node ui-bridge\server.ts"

REM Wait briefly for server startup
timeout /t 2 >nul

REM Start ALIVE UI
cd /d C:\Users\mikeh\dev\alive-system\ui-shell\alive-ui
npm run tauri dev
npm run tauri dev



