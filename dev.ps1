# dev.ps1 — Lucida Studio Development Launcher
# Starts the API backend in a NEW PowerShell window, then runs the Nuxt frontend here.

$root = $PSScriptRoot

Write-Host "`n  ┌─────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "  │   Lucida Studio — Dev Environment       │" -ForegroundColor Cyan
Write-Host "  └─────────────────────────────────────────┘`n" -ForegroundColor Cyan

Write-Host "  Starting API server in a new terminal..." -ForegroundColor DarkCyan

# Launch the API backend in a new PowerShell window
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root'; Write-Host '  [API] Lucida Backend' -ForegroundColor Cyan; npm run dev:api"
) -WindowStyle Normal

# Small delay to let the API window open
Start-Sleep -Milliseconds 600

Write-Host "  Starting Nuxt frontend on http://localhost:3001 ...`n" -ForegroundColor DarkCyan

# Start the frontend in this terminal
Set-Location $root
npm run dev:web
