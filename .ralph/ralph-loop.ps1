# Ralph Loop for Windows PowerShell
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\.."
Set-Location $ProjectRoot

$PromptFile = "$ScriptDir\prompt.md"

Write-Host "🚀 Starting Ralph Loop with Claude Code (Windows PowerShell)..." -ForegroundColor Cyan
Write-Host "Working directory: $ProjectRoot"
Write-Host "Prompt file: $PromptFile"

if (-not (Test-Path $PromptFile)) {
    Write-Error "Prompt file not found at $PromptFile"
    exit 1
}

while ($true) {
    Write-Host ""
    Write-Host "🔁 Ralph Loop iteration starting..." -ForegroundColor Yellow
    Write-Host "-------------------------------------------"

    $promptContent = Get-Content -Raw -Path $PromptFile

    # Run Claude Code in headless mode
    try {
        claude -p --dangerously-skip-permissions "$promptContent"
    }
    catch {
        Write-Warning "Claude Code exited with an error or was interrupted."
    }

    # Optional: run CodeRabbit review
    Write-Host ""
    Write-Host "🐇 Running CodeRabbit review..." -ForegroundColor Green
    try {
        coderabbit review --agent
    }
    catch {
        Write-Host "CodeRabbit review skipped or not installed; continuing." -ForegroundColor DarkGray
    }

    Write-Host "✅ Iteration complete. Sleeping 2s before next loop..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
}
