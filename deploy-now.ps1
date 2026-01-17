# Скрипт для быстрого деплоя на Vercel

Write-Host "🚀 Деплой Loyverse на Vercel" -ForegroundColor Cyan
Write-Host ""

# Проверяем, установлен ли Vercel CLI
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "📦 Установка Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка установки Vercel CLI" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Vercel CLI установлен" -ForegroundColor Green
Write-Host ""

# Деплой App
Write-Host "📱 Деплой App (клиентское)..." -ForegroundColor Yellow
Set-Location app
vercel --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка деплоя App" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "👤 Деплой Owner..." -ForegroundColor Yellow
Set-Location owner
vercel --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка деплоя Owner" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "💰 Деплой Cashier..." -ForegroundColor Yellow
Set-Location cashier
vercel --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка деплоя Cashier" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "✅ Все frontend приложения задеплоены!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Задеплойте backend на Railway (см. DEPLOY_STEP_BY_STEP.md)" -ForegroundColor White
Write-Host "2. Добавьте VITE_API_URL в каждый проект Vercel" -ForegroundColor White
Write-Host "3. Настройте Mini Apps через setup-mini-apps" -ForegroundColor White
