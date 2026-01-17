# Скрипт для быстрой настройки туннеля (Localtunnel)

Write-Host "🔧 Настройка туннеля для Loyverse" -ForegroundColor Cyan

# Проверяем, установлен ли localtunnel
$ltInstalled = Get-Command lt -ErrorAction SilentlyContinue

if (-not $ltInstalled) {
    Write-Host "📦 Установка localtunnel..." -ForegroundColor Yellow
    npm install -g localtunnel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка установки localtunnel" -ForegroundColor Red
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

Write-Host "🚀 Запуск туннеля на порту 8080..." -ForegroundColor Green
Write-Host "Скопируйте полученный URL и обновите backend/.env" -ForegroundColor Cyan
Write-Host ""

# Запускаем localtunnel
lt --port 8080
