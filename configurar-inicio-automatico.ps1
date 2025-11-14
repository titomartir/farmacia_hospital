# Script para configurar el inicio automatico del sistema

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAR INICIO AUTOMATICO" -ForegroundColor Cyan
Write-Host "  Sistema de Farmacia Hospitalaria" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como administrador
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ADVERTENCIA: Este script requiere permisos de administrador" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Cyan
    Write-Host "1. Configurar inicio automatico (requiere Admin)" -ForegroundColor White
    Write-Host "2. Crear acceso directo en el escritorio (NO requiere Admin)" -ForegroundColor White
    Write-Host "3. Salir" -ForegroundColor White
    Write-Host ""
    $opcion = Read-Host "Seleccione una opcion (1-3)"
    
    if ($opcion -eq "1") {
        Write-Host ""
        Write-Host "Reiniciando con permisos de administrador..." -ForegroundColor Yellow
        Start-Process powershell -Verb RunAs -ArgumentList "-NoExit", "-Command", "cd 'C:\farmacia_hospital'; .\configurar-inicio-automatico.ps1"
        exit
    } elseif ($opcion -eq "2") {
        # Continuar sin permisos de admin
    } else {
        exit
    }
}

$PROJECT_DIR = "C:\farmacia_hospital"

# Tarea programada de Windows (Requiere Admin)
if ($isAdmin) {
    Write-Host "[PASO 1] Configurando tarea programada de Windows..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Eliminar tarea existente si existe
        $existingTask = Get-ScheduledTask -TaskName "FarmaciaHospital_AutoInicio" -ErrorAction SilentlyContinue
        if ($existingTask) {
            Unregister-ScheduledTask -TaskName "FarmaciaHospital_AutoInicio" -Confirm:$false
            Write-Host "  Tarea anterior eliminada" -ForegroundColor Gray
        }
        
        # Registrar nueva tarea desde XML
        Register-ScheduledTask -Xml (Get-Content "$PROJECT_DIR\tarea-inicio-automatico.xml" | Out-String) -TaskName "FarmaciaHospital_AutoInicio" -Force | Out-Null
        
        Write-Host "  OK - Tarea programada creada exitosamente" -ForegroundColor Green
        Write-Host "  OK - El sistema se iniciara automaticamente al iniciar sesion (30s despues)" -ForegroundColor Green
        Write-Host ""
        Write-Host "Para deshabilitar el inicio automatico:" -ForegroundColor Cyan
        Write-Host "  1. Abrir 'Programador de tareas' (taskschd.msc)" -ForegroundColor White
        Write-Host "  2. Buscar 'FarmaciaHospital_AutoInicio'" -ForegroundColor White
        Write-Host "  3. Deshabilitar o eliminar la tarea" -ForegroundColor White
    } catch {
        Write-Host "  ERROR al crear tarea programada: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Acceso directo en el escritorio
Write-Host "[PASO 2] Creando acceso directo en el escritorio..." -ForegroundColor Yellow

$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Farmacia Hospital - Iniciar Sistema.lnk"

try {
    $WScriptShell = New-Object -ComObject WScript.Shell
    $shortcut = $WScriptShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$PROJECT_DIR\iniciar-sistema.ps1`""
    $shortcut.WorkingDirectory = $PROJECT_DIR
    $shortcut.IconLocation = "shell32.dll,21"
    $shortcut.Description = "Iniciar Sistema de Farmacia Hospitalaria"
    $shortcut.Save()
    
    Write-Host "  OK - Acceso directo creado en el escritorio" -ForegroundColor Green
    Write-Host "  Ubicacion: $shortcutPath" -ForegroundColor Green
} catch {
    Write-Host "  ERROR al crear acceso directo: $($_.Exception.Message)" -ForegroundColor Red
}

# Acceso directo para DETENER el sistema
Write-Host ""
Write-Host "[PASO 3] Creando acceso directo para DETENER sistema..." -ForegroundColor Yellow

$shortcutStopPath = Join-Path $desktopPath "Farmacia Hospital - Detener Sistema.lnk"

try {
    $WScriptShell = New-Object -ComObject WScript.Shell
    $shortcut = $WScriptShell.CreateShortcut($shortcutStopPath)
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$PROJECT_DIR\detener-sistema.ps1`""
    $shortcut.WorkingDirectory = $PROJECT_DIR
    $shortcut.IconLocation = "shell32.dll,27"
    $shortcut.Description = "Detener Sistema de Farmacia Hospitalaria"
    $shortcut.Save()
    
    Write-Host "  OK - Acceso directo para detener creado en el escritorio" -ForegroundColor Green
    Write-Host "  Ubicacion: $shortcutStopPath" -ForegroundColor Green
} catch {
    Write-Host "  ERROR al crear acceso directo: $($_.Exception.Message)" -ForegroundColor Red
}

# Instrucciones Docker Desktop
Write-Host ""
Write-Host "[PASO 4] Verificando Docker Desktop..." -ForegroundColor Yellow

Write-Host "  IMPORTANTE: Para que el sistema funcione automaticamente:" -ForegroundColor Cyan
Write-Host "  1. Abrir Docker Desktop" -ForegroundColor White
Write-Host "  2. Ir a Settings (Configuracion)" -ForegroundColor White
Write-Host "  3. En 'General', activar:" -ForegroundColor White
Write-Host "     [X] Start Docker Desktop when you log in" -ForegroundColor Green
Write-Host "  4. Aplicar y reiniciar Docker" -ForegroundColor White

# RESUMEN
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  CONFIGURACION COMPLETADA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos creados:" -ForegroundColor Cyan

if ($isAdmin) {
    Write-Host "  OK - Tarea programada: FarmaciaHospital_AutoInicio" -ForegroundColor Green
}

Write-Host "  OK - Acceso directo (Iniciar): $shortcutPath" -ForegroundColor Green
Write-Host "  OK - Acceso directo (Detener): $shortcutStopPath" -ForegroundColor Green
Write-Host ""
Write-Host "Scripts disponibles:" -ForegroundColor Cyan
Write-Host "  iniciar-sistema.ps1 - Inicia todos los servicios" -ForegroundColor White
Write-Host "  detener-sistema.ps1 - Detiene todos los servicios" -ForegroundColor White
Write-Host ""

if ($isAdmin) {
    Write-Host "El sistema se iniciara automaticamente en el proximo inicio de sesion." -ForegroundColor Yellow
} else {
    Write-Host "Para habilitar inicio automatico, ejecute este script como Administrador." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Presione cualquier tecla para cerrar..." -ForegroundColor Gray
pause
