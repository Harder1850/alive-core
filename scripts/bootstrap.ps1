$ErrorActionPreference = "Stop"

# ================================
# ALIVE CORE — Safe Bootstrap (Option B)
# ================================
#
# Purpose:
# - Ensure the ALIVE-CORE directory skeleton exists
# - Create TODO-only placeholder files for NON-SPINE modules
#
# Hard safety rules:
# - MUST NOT write or modify any content under ./spine/
# - In particular, MUST NOT generate or overwrite spine/INVARIANTS.md
#

function Ensure-Directory([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
    New-Item -ItemType Directory -Force -Path $Path | Out-Null
  }
}

function Ensure-File([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    $parent = Split-Path -Parent $Path
    if ($parent) { Ensure-Directory $parent }
    New-Item -ItemType File -Force -Path $Path | Out-Null
  }
}

function Assert-NotSpinePath([string]$Path) {
  # Normalize to forward slashes for comparison
  $p = $Path -replace "\\", "/"
  if ($p -match "^(spine/|\./spine/)") {
    throw "Refusing to operate on spine path: $Path"
  }
}

function Ensure-TodoPlaceholder([string]$Path) {
  Assert-NotSpinePath $Path

  Ensure-File $Path

  # Only write if file is empty (avoid overwriting any later implementations).
  $existing = ""
  try {
    $existing = Get-Content -LiteralPath $Path -Raw -ErrorAction Stop
  } catch {
    $existing = ""
  }

  if ([string]::IsNullOrWhiteSpace($existing)) {
    "// TODO: implemented after spine invariants are enforced" | Set-Content -LiteralPath $Path -Encoding UTF8
  }
}

# ---- FOLDERS (including spine, but NO file writes inside spine) ----
$dirs = @(
  "spine",
  "spine/loop",
  "spine/conscious",
  "spine/ingress",
  "spine/arbitration",
  "spine/egress",

  "unconscious/fast",
  "unconscious/slow",

  "memory/short_term",
  "memory/long_term",
  "memory/index",

  "agents",
  "interfaces",
  "runtime",
  "utils",

  "scripts"
)

$dirs | ForEach-Object { Ensure-Directory $_ }

# ---- FILES (NON-SPINE ONLY) ----
# Note: this intentionally does NOT create or modify any spine/*.ts or spine/INVARIANTS.md.
$todoFiles = @(
  "unconscious/fast/scaffolding.ts",
  "unconscious/fast/hypothesis.ts",
  "unconscious/fast/prefetch.ts",

  "unconscious/slow/learning.ts",
  "unconscious/slow/simulation.ts",
  "unconscious/slow/abstraction.ts",

  "memory/short_term/cache.ts",
  "memory/long_term/store.ts",
  "memory/index/semantic.ts",

  "agents/planner.ts",
  "agents/researcher.ts",
  "agents/monitor.ts",
  "agents/executor.ts",

  "interfaces/input.ts",
  "interfaces/output.ts",
  "interfaces/sensors.ts",

  "runtime/scheduler.ts",
  "runtime/clock.ts",

  "utils/types.ts"
)

$todoFiles | ForEach-Object { Ensure-TodoPlaceholder $_ }

Write-Host "ALIVE CORE safe bootstrap complete. (No spine files modified.)"

