# Script de inicio automatico del Sistema de Farmacia

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SISTEMA DE FARMACIA HOSPITALARIA" -ForegroundColor Cyan
Write-Host "  Iniciando servicios..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_DIR = "C:\farmacia_hospital"
Set-Location $PROJECT_DIR

# PASO 1: Verificar Docker
Write-Host "[1/4] Verificando Docker..." -ForegroundColor Yellow

try {
    $dockerVersion = docker --version
    Write-Host "  OK - Docker detectado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Docker no esta instalado o no esta en el PATH" -ForegroundColor Red
    Write-Host "  Por favor instale Docker Desktop" -ForegroundColor Red
    pause
    exit 1
}

try {
    $null = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Engine no responde"
    }
    Write-Host "  OK - Docker Engine esta corriendo" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "  ERROR: Docker Desktop NO esta corriendo" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Por favor:" -ForegroundColor Yellow
    Write-Host "  1. Abre Docker Desktop desde el menu de Windows" -ForegroundColor White
    Write-Host "  2. Espera a que se inicie completamente (icono de ballena en la bandeja)" -ForegroundColor White
    Write-Host "  3. Vuelve a ejecutar este script" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

# PASO 2: Iniciar contenedores Docker
Write-Host ""
Write-Host "[2/4] Iniciando contenedores Docker (PostgreSQL + Backend)..." -ForegroundColor Yellow

docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK - Contenedores iniciados correctamente" -ForegroundColor Green
} else {
    Write-Host "  ERROR al iniciar contenedores" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "  Esperando a que los servicios esten listos..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

$dbStatus = docker inspect --format='{{.State.Health.Status}}' farmacia_db 2>$null
$backendStatus = docker inspect --format='{{.State.Health.Status}}' farmacia_backend 2>$null

$maxRetries = 12
$retryCount = 0

while (($dbStatus -ne "healthy" -or $backendStatus -ne "healthy") -and $retryCount -lt $maxRetries) {
    $retryCount++
    Write-Host "  Intento $retryCount/$maxRetries - DB: $dbStatus | Backend: $backendStatus" -ForegroundColor Gray
    Start-Sleep -Seconds 5
    $dbStatus = docker inspect --format='{{.State.Health.Status}}' farmacia_db 2>$null
    $backendStatus = docker inspect --format='{{.State.Health.Status}}' farmacia_backend 2>$null
}

if ($dbStatus -eq "healthy" -and $backendStatus -eq "healthy") {
    Write-Host "  OK - Base de datos PostgreSQL: HEALTHY" -ForegroundColor Green
    Write-Host "  OK - Backend API: HEALTHY" -ForegroundColor Green
} else {
    Write-Host "  ADVERTENCIA: Servicios iniciados pero aun no estan completamente listos" -ForegroundColor Yellow
    Write-Host "  Continuando de todas formas..." -ForegroundColor Yellow
}

# PASO 3: Verificar Backend API
Write-Host ""
Write-Host "[3/4] Verificando Backend API..." -ForegroundColor Yellow

$maxRetries = 6
$retryCount = 0
$backendReady = $false

while (-not $backendReady -and $retryCount -lt $maxRetries) {
    $retryCount++
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"nombre_usuario": "test", "password": "test"}' -ErrorAction SilentlyContinue
        $backendReady = $true
    } catch {
        Write-Host "  Intento $retryCount/$maxRetries - Esperando respuesta del backend..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
}

if ($backendReady) {
    Write-Host "  OK - Backend API respondiendo en http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "  ADVERTENCIA: Backend no responde, pero continuaremos..." -ForegroundColor Yellow
}

# PASO 4: Iniciar Frontend
Write-Host ""
Write-Host "[4/4] Iniciando Frontend..." -ForegroundColor Yellow

$port5174 = Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue
if ($port5174) {
    Write-Host "  Puerto 5174 ya esta en uso, liberando..." -ForegroundColor Yellow
    Stop-Process -Id $port5174.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

$frontendPath = Join-Path $PROJECT_DIR "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Iniciando Frontend Vite...' -ForegroundColor Cyan; npm run dev"

Write-Host "  OK - Frontend iniciandose en nueva ventana..." -ForegroundColor Green
Write-Host "  OK - Estara disponible en: http://localhost:5173 o http://localhost:5174" -ForegroundColor Green

# RESUMEN
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  SISTEMA INICIADO CORRECTAMENTE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Servicios disponibles:" -ForegroundColor Cyan
Write-Host "  Base de datos PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "  Backend API: http://localhost:3000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173 o http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "Credenciales de prueba:" -ForegroundColor Cyan
Write-Host "  Usuario: ANA MERCEDES" -ForegroundColor White
Write-Host "  Password: usuario" -ForegroundColor White
Write-Host ""
Write-Host "Para detener todos los servicios, ejecute: .\detener-sistema.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presione cualquier tecla para cerrar esta ventana..." -ForegroundColor Gray
pause
