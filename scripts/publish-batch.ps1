# Publish the packages fixed in the 2026-07-30 review pass.
#
# Safe to re-run. Every package whose current version is already on npm is skipped, so
# if the 2FA window lapses part-way through you can just run it again and it picks up
# where it stopped. A failure does not abort the run — the summary at the end lists
# exactly what landed and what did not.
#
#   pwsh scripts/publish-batch.ps1              # no OTP (2FA window open, or automation token)
#   pwsh scripts/publish-batch.ps1 -Otp 123456  # pass a one-time password
#   pwsh scripts/publish-batch.ps1 -DryRun      # show what would publish, change nothing
#
# Note: npm is invoked directly rather than through `& npm @argArray`. Splatting an
# array into a native command mangled argv here — npm received "pm" as its subcommand
# and every publish failed before it started. Success is confirmed by re-querying the
# registry afterwards, not by trusting $LASTEXITCODE.

param(
    [string]$Otp,
    [switch]$DryRun
)

$ErrorActionPreference = 'Continue'

# Ordered smallest-blast-radius first, so an early failure costs the least.
$packages = @(
    'online', 'fullscreen', 'search', 'resize', 'json', 'markdown',
    'menu', 'command', 'crop', 'card', 'timeline', 'time', 'sparkline', 'slider',
    'upload', 'currency', 'mask', 'i18n', 'paste', 'tabs', 'otp', 'gauge', 'split',
    'tree', 'dropzone', 'code', 'chart', 'date'
)

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$published = @()
$skipped = @()
$failed = @()

foreach ($name in $packages) {
    $manifest = Join-Path $root "packages/$name/package.json"
    if (-not (Test-Path $manifest)) {
        Write-Host "[?]    $name - no package.json, skipping" -ForegroundColor DarkGray
        continue
    }

    $pkg = Get-Content $manifest -Raw | ConvertFrom-Json
    $fullName = $pkg.name
    $version = $pkg.version
    $spec = "$fullName@$version"

    # Already up there? Nothing to do.
    $onNpm = npm view $spec version 2>$null
    if ($onNpm -eq $version) {
        Write-Host "[skip] $spec already on npm" -ForegroundColor DarkGray
        $skipped += $spec
        continue
    }

    if ($DryRun) {
        Write-Host "[dry]  would publish $spec" -ForegroundColor Cyan
        continue
    }

    Write-Host "[pub]  $spec ..." -ForegroundColor Cyan

    if ($Otp) {
        npm publish -w $fullName --access public --otp $Otp 2>&1 | Out-Null
    }
    else {
        npm publish -w $fullName --access public 2>&1 | Out-Null
    }

    # Ground truth: ask the registry whether it actually landed.
    Start-Sleep -Milliseconds 400
    $verify = npm view $spec version 2>$null
    if ($verify -eq $version) {
        Write-Host "[ok]   $spec" -ForegroundColor Green
        $published += $spec
    }
    else {
        Write-Host "[FAIL] $spec" -ForegroundColor Red
        $failed += $spec
        # Three consecutive failures almost certainly means auth lapsed rather than
        # anything package-specific; stop instead of burning through the rest.
        if ($failed.Count -ge 3 -and $published.Count -eq 0) {
            Write-Host ""
            Write-Host "Three failures with nothing published - stopping." -ForegroundColor Yellow
            Write-Host "Re-authenticate, then re-run: already-published packages are skipped." -ForegroundColor Yellow
            break
        }
    }
}

Write-Host ""
Write-Host "================ summary ================"
Write-Host ("published: {0}" -f $published.Count) -ForegroundColor Green
$published | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }
Write-Host ("skipped:   {0}" -f $skipped.Count) -ForegroundColor DarkGray
Write-Host ("failed:    {0}" -f $failed.Count) -ForegroundColor $(if ($failed.Count) { 'Red' } else { 'DarkGray' })
$failed | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
Write-Host "========================================="

if ($failed.Count -gt 0) { exit 1 }
