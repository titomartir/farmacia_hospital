# Script para crear acceso directo en el escritorio

$WshShell = New-Object -ComObject WScript.Shell
$Desktop = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $Desktop "▶️ INICIAR Sistema Farmacia.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "C:\farmacia_hospital\INICIAR_SISTEMA.bat"
$Shortcut.WorkingDirectory = "C:\farmacia_hospital"
$Shortcut.Description = "Inicia todos los servicios del Sistema de Farmacia Hospitalaria"
$Shortcut.IconLocation = "C:\Windows\System32\SHELL32.dll,137" # Icono de play verde
$Shortcut.Save()

Write-Host "✅ Acceso directo creado en el escritorio: ▶️ INICIAR Sistema Farmacia" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora tienes dos accesos directos:" -ForegroundColor Cyan
Write-Host "  ▶️ INICIAR Sistema Farmacia - Arranca todos los servicios" -ForegroundColor White
Write-Host "  ⏹️ DETENER Sistema Farmacia - Detiene todos los servicios" -ForegroundColor White
Write-Host ""
pause
