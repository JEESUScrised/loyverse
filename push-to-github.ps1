# Скрипт для загрузки кода в GitHub
# Использование: .\push-to-github.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubToken,
    
    [Parameter(Mandatory=$true)]
    [string]$RepoName = "loyverse",
    
    [string]$GitHubUsername = ""
)

Write-Host "🚀 Подготовка к загрузке в GitHub..." -ForegroundColor Cyan

# Проверяем, что git инициализирован
if (-not (Test-Path ".git")) {
    Write-Host "📦 Инициализация git репозитория..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Добавляем все файлы
Write-Host "📝 Добавление файлов..." -ForegroundColor Yellow
git add .

# Проверяем статус
$status = git status --short
if ($status) {
    Write-Host "✅ Найдены изменения для коммита" -ForegroundColor Green
    Write-Host ""
    Write-Host "Изменения:" -ForegroundColor Cyan
    git status --short
    
    # Создаем коммит
    Write-Host ""
    Write-Host "💾 Создание коммита..." -ForegroundColor Yellow
    git commit -m "Initial commit: Ready for deployment"
    
    # Настраиваем remote
    if ($GitHubUsername) {
        $remoteUrl = "https://${GitHubToken}@github.com/${GitHubUsername}/${RepoName}.git"
    } else {
        Write-Host ""
        Write-Host "⚠️  GitHub username не указан" -ForegroundColor Yellow
        Write-Host "Введите ваш GitHub username:" -ForegroundColor Cyan
        $GitHubUsername = Read-Host
        $remoteUrl = "https://${GitHubToken}@github.com/${GitHubUsername}/${RepoName}.git"
    }
    
    # Проверяем, есть ли уже remote
    $existingRemote = git remote get-url origin 2>$null
    if ($existingRemote) {
        Write-Host "🔄 Обновление remote URL..." -ForegroundColor Yellow
        git remote set-url origin $remoteUrl
    } else {
        Write-Host "🔗 Добавление remote..." -ForegroundColor Yellow
        git remote add origin $remoteUrl
    }
    
    Write-Host ""
    Write-Host "📤 Загрузка в GitHub..." -ForegroundColor Yellow
    Write-Host "⚠️  ВАЖНО: Если репозиторий еще не создан на GitHub, создайте его сначала!" -ForegroundColor Red
    Write-Host ""
    
    # Push
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Код успешно загружен в GitHub!" -ForegroundColor Green
        Write-Host "🔗 Репозиторий: https://github.com/${GitHubUsername}/${RepoName}" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Ошибка при загрузке" -ForegroundColor Red
        Write-Host "Проверьте:" -ForegroundColor Yellow
        Write-Host "1. Репозиторий создан на GitHub" -ForegroundColor White
        Write-Host "2. Токен имеет права на запись" -ForegroundColor White
        Write-Host "3. Имя репозитория правильное" -ForegroundColor White
    }
} else {
    Write-Host "ℹ️  Нет изменений для коммита" -ForegroundColor Cyan
}
