# Script para detener todos los servicios del Sistema de Farmacia

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SISTEMA DE FARMACIA HOSPITALARIA" -ForegroundColor Cyan
Write-Host "  Deteniendo servicios..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_DIR = "C:\farmacia_hospital"
Set-Location $PROJECT_DIR

# PASO 1: Detener Frontend (Puerto 5173 y 5174)
Write-Host "[1/2] Deteniendo Frontend..." -ForegroundColor Yellow

$frontendProcesses = @()
$frontendProcesses += Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
$frontendProcesses += Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue

if ($frontendProcesses.Count -gt 0) {
    foreach ($conn in $frontendProcesses) {
        if ($conn) {
            try {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "  OK - Proceso detenido: PID $($conn.OwningProcess)" -ForegroundColor Green
            } catch {
                Write-Host "  ADVERTENCIA: No se pudo detener PID $($conn.OwningProcess)" -ForegroundColor Yellow
            }
        }
    }
} else {
    Write-Host "  No hay procesos frontend corriendo" -ForegroundColor Gray
}

$viteProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*vite*" -or $_.CommandLine -like "*vite*"
}

foreach ($proc in $viteProcesses) {
    try {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Write-Host "  OK - Proceso Vite detenido: PID $($proc.Id)" -ForegroundColor Green
    } catch {
        Write-Host "  ADVERTENCIA: No se pudo detener proceso Vite PID $($proc.Id)" -ForegroundColor Yellow
    }
}

# PASO 2: Detener contenedores Docker
Write-Host ""
Write-Host "[2/2] Deteniendo contenedores Docker..." -ForegroundColor Yellow

docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK - Contenedores detenidos correctamente" -ForegroundColor Green
} else {
    Write-Host "  ADVERTENCIA: Hubo problemas al detener contenedores" -ForegroundColor Yellow
}

# RESUMEN
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  TODOS LOS SERVICIOS DETENIDOS" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para volver a iniciar el sistema, ejecute: .\iniciar-sistema.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presione cualquier tecla para cerrar esta ventana..." -ForegroundColor Gray
pause
