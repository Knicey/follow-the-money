$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Error "Python was not found on PATH."
    exit 1
}

Push-Location $PSScriptRoot
try {
    & $python.Source -c "import fastapi, uvicorn, psycopg, psycopg_pool, dotenv"
    if ($LASTEXITCODE -ne 0) {
        throw "Required packages are missing for this Python interpreter. Install them with: python -m pip install -r requirements.txt"
    }

    Start-Process "http://localhost:8000/docs"
    & $python.Source -m uvicorn backend.main:app --reload
    $serverExitCode = $LASTEXITCODE
}
finally {
    Pop-Location
}

if ($serverExitCode -ne 0) {
    exit $serverExitCode
}