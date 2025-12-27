Param()
$ErrorActionPreference = 'Stop'

if ($env:ALLOW_SECRET_PUSH) {
  Write-Host "⚠️  ALLOW_SECRET_PUSH set; skipping secret scan."
  exit 0
}

$allowlist = @(
  'frontend/.env.example',
  'backend/env.example'
)

$patterns = @(
  @{ name = 'Firebase Web API Key'; regex = 'AIza[0-9A-Za-z\-_]{35}'; severity = 'warn' },
  @{ name = 'AWS Access Key ID'; regex = 'AKIA[0-9A-Z]{16}'; severity = 'error' },
  @{ name = 'Stripe Secret Key'; regex = 'sk_(live|test)_[0-9A-Za-z]{24,}'; severity = 'error' },
  @{ name = 'Private Key Header'; regex = '-----BEGIN (?:RSA )?PRIVATE KEY-----'; severity = 'error' },
  @{ name = 'Generic API Key'; regex = 'api_key\s*[:=]\s*\"[A-Za-z0-9_\-]{20,}\"'; severity = 'warn' }
)

$violations = @()

$files = git diff --cached --name-only
foreach ($f in $files) {
  if ($allowlist -contains $f) { continue }
  $blob = (& git show ":$f" 2>$null)
  foreach ($p in $patterns) {
    if ($blob -match $p.regex) {
      $violations += [pscustomobject]@{ File = $f; Name = $p.name; Severity = $p.severity }
    }
  }
}

if ($violations.Count -gt 0) {
  Write-Host "❌ Secret patterns detected in staged files:" -ForegroundColor Red
  foreach ($v in $violations) { Write-Host " - $($v.Name) in $($v.File)" }
  Write-Host "To bypass temporarily: set ALLOW_SECRET_PUSH=1" -ForegroundColor Yellow
  Write-Host "Fix by moving secrets to env vars and ignoring sensitive files."
  exit 1
}

Write-Host "✅ Pre-commit secret scan passed."