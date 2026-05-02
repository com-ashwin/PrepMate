# PrepMate Research Backend Startup Script (PowerShell)
Set-Location $PSScriptRoot

# Check if venv exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate venv
& ".\venv\Scripts\Activate.ps1"

# Install/update requirements
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt -q

# Copy env if not exists
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Created .env from .env.example — please add your API keys!" -ForegroundColor Red
}

Write-Host "🚀 Starting PrepMate Research Backend on http://localhost:8001" -ForegroundColor Green
python main.py
