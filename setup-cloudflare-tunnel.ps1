# Скрипт для установки и запуска Cloudflare Tunnel

Write-Host "🔧 Настройка Cloudflare Tunnel для Loyverse" -ForegroundColor Cyan

$cloudflaredPath = "$env:USERPROFILE\cloudflared\cloudflared.exe"
$cloudflaredDir = "$env:USERPROFILE\cloudflared"

# Проверяем, установлен ли cloudflared
if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "📦 Cloudflare Tunnel не найден. Установка..." -ForegroundColor Yellow
    
    # Создаем папку
    if (-not (Test-Path $cloudflaredDir)) {
        New-Item -ItemType Directory -Path $cloudflaredDir -Force | Out-Null
    }
    
    Write-Host "Скачивание cloudflared..." -ForegroundColor Yellow
    Write-Host "Пожалуйста, скачайте вручную:" -ForegroundColor Yellow
    Write-Host "1. Откройте: https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor Cyan
    Write-Host "2. Скачайте: cloudflared-windows-amd64.exe" -ForegroundColor Cyan
    Write-Host "3. Переименуйте в cloudflared.exe" -ForegroundColor Cyan
    Write-Host "4. Поместите в: $cloudflaredDir" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Нажмите Enter после установки..." -ForegroundColor Yellow
    Read-Host
    
    if (-not (Test-Path $cloudflaredPath)) {
        Write-Host "❌ cloudflared.exe не найден в $cloudflaredDir" -ForegroundColor Red
        exit 1
    }
}

# Проверяем, запущен ли прокси на порту 8080
$proxyRunning = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue

if (-not $proxyRunning) {
    Write-Host "⚠️  Прокси-сервер не запущен на порту 8080" -ForegroundColor Yellow
    Write-Host "Запустите прокси в другом терминале:" -ForegroundColor Yellow
    Write-Host "  cd C:\Users\user\Desktop\Loyverse" -ForegroundColor Gray
    Write-Host "  node proxy-server-express.js" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Нажмите Enter после запуска прокси..." -ForegroundColor Yellow
    Read-Host
}

Write-Host "🚀 Запуск Cloudflare Tunnel на порту 8080..." -ForegroundColor Green
Write-Host "Скопируйте полученный URL и обновите backend/.env" -ForegroundColor Cyan
Write-Host ""

# Запускаем cloudflared
& $cloudflaredPath tunnel --url http://localhost:8080
