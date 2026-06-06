$ErrorActionPreference = 'Stop'

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$runtimePortsFile = Join-Path $workspaceRoot 'storage\runtime\dev-ports.json'

function Get-FreePort {
  param(
    [int]$StartPort = 3001,
    [int]$MaxAttempts = 20
  )

  for ($offset = 0; $offset -lt $MaxAttempts; $offset++) {
    $port = $StartPort + $offset
    $listener = $null

    try {
      $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
      $listener.Start()
      return $port
    } catch {
      continue
    } finally {
      if ($listener) {
        $listener.Stop()
      }
    }
  }

  throw "No available port found starting from $StartPort"
}

function Start-DevWindow {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Title,
    [Parameter(Mandatory = $true)]
    [string]$Command
  )

  $escapedRoot = $workspaceRoot.Replace("'", "''")
  $escapedTitle = $Title.Replace("'", "''")
  $psCommand = "Set-Location '$escapedRoot'; `$Host.UI.RawUI.WindowTitle = '$escapedTitle'; $Command"

  Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $psCommand
}

$apiPort = Get-FreePort -StartPort 3001

if (Test-Path $runtimePortsFile) {
  Remove-Item -LiteralPath $runtimePortsFile -Force
}

Start-DevWindow -Title "Study API" -Command "`$env:PORT='$apiPort'; `$env:STUDY_RUNTIME_PORTS_FILE='$runtimePortsFile'; npm run dev:api"

$apiReady = $false
for ($attempt = 0; $attempt -lt 40; $attempt++) {
  Start-Sleep -Milliseconds 250

  try {
    Invoke-RestMethod -Uri "http://localhost:$apiPort/api/knowledge/spaces" -TimeoutSec 2 | Out-Null
    $apiReady = $true
    break
  } catch {
    continue
  }
}

Start-DevWindow -Title "Study Web" -Command "`$env:API_PORT='$apiPort'; `$env:STUDY_RUNTIME_PORTS_FILE='$runtimePortsFile'; npm run dev:web"

Write-Host "Launched dev windows: Study API / Study Web"
Write-Host "API port: $apiPort"
Write-Host "API ready before web start: $apiReady"
