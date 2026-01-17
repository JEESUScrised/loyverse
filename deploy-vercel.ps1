# Быстрый деплой всех frontend приложений на Vercel (PowerShell)

Write-Host "🚀 Деплой на Vercel..." -ForegroundColor Green

Write-Host ""
Write-Host "📦 Деплой App (клиентское)..." -ForegroundColor Cyan
Set-Location app
vercel --prod
Set-Location ..

Write-Host ""
Write-Host "📦 Деплой Owner..." -ForegroundColor Cyan
Set-Location owner
vercel --prod
Set-Location ..

Write-Host ""
Write-Host "📦 Деплой Cashier..." -ForegroundColor Cyan
Set-Location cashier
vercel --prod
Set-Location ..

Write-Host ""
Write-Host "✅ Все приложения задеплоены!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Не забудьте:" -ForegroundColor Yellow
Write-Host "   1. Обновить VITE_API_URL в настройках Vercel"
Write-Host "   2. Задеплоить backend на Railway"
Write-Host "   3. Запустить: npm run setup-mini-apps"
