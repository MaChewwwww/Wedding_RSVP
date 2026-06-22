param(
  [ValidateSet("local", "linked")]
  [string]$Target = "local",
  [switch]$NoSeed,
  [string]$Confirmation
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $repoRoot "supabase\config.toml"

if (-not (Test-Path -LiteralPath $configPath)) {
  throw "Supabase is not initialized. Run 'pnpm dlx supabase init' first."
}

if ($Target -eq "linked") {
  $required = "RESET LINKED WEDDING DATABASE"
  if ($Confirmation -ne $required) {
    throw "Remote reset refused. Re-run with -Confirmation '$required'."
  }
}

$arguments = @("dlx", "supabase", "db", "reset")
if ($Target -eq "local") {
  $arguments += "--local"
} else {
  $arguments += "--linked"
}
if ($NoSeed) {
  $arguments += "--no-seed"
}

Push-Location $repoRoot
try {
  & pnpm @arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Supabase database reset failed with exit code $LASTEXITCODE."
  }
} finally {
  Pop-Location
}
