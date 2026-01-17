# PowerShell скрипт для деплоя на сервер

$SERVER_IP = "149.33.4.37"
$SERVER_USER = "root"
$SERVER_PASSWORD = "PUR42mjSai"
$DOMAIN = "jeesuscrised.ru"
$REMOTE_DIR = "/var/www/loyverse"

Write-Host "🚀 Начинаем деплой Loyverse приложений" -ForegroundColor Green

# Собираем все приложения
Write-Host "📦 Собираем приложения..." -ForegroundColor Green

Write-Host "Сборка app..." -ForegroundColor Yellow
Set-Location app
npm install
npm run build
Set-Location ..

Write-Host "Сборка owner..." -ForegroundColor Yellow
Set-Location owner
npm install
npm run build
Set-Location ..

Write-Host "Сборка cashier..." -ForegroundColor Yellow
Set-Location cashier
npm install
npm run build
Set-Location ..

# Устанавливаем sshpass или используем встроенный SSH
Write-Host "📤 Загружаем файлы на сервер..." -ForegroundColor Green

# Проверяем наличие sshpass или используем plink/pscp
$useSSHPass = $false
if (Get-Command sshpass -ErrorAction SilentlyContinue) {
    $useSSHPass = $true
}

# Создаем директорию на сервере
if ($useSSHPass) {
    Write-Host "Создаем директорию на сервере..." -ForegroundColor Yellow
    echo y | plink -ssh -pw $SERVER_PASSWORD $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR"
    
    # Копируем файлы
    Write-Host "Копируем app..." -ForegroundColor Yellow
    pscp -pw $SERVER_PASSWORD -r app/dist/* $SERVER_USER@$SERVER_IP`:$REMOTE_DIR/app/
    
    Write-Host "Копируем owner..." -ForegroundColor Yellow
    pscp -pw $SERVER_PASSWORD -r owner/dist/* $SERVER_USER@$SERVER_IP`:$REMOTE_DIR/owner/
    
    Write-Host "Копируем cashier..." -ForegroundColor Yellow
    pscp -pw $SERVER_PASSWORD -r cashier/dist/* $SERVER_USER@$SERVER_IP`:$REMOTE_DIR/cashier/
} else {
    Write-Host "Используем встроенный SSH (требует ручного ввода пароля)" -ForegroundColor Yellow
    Write-Host "Или установите PuTTY (plink/pscp) для автоматизации" -ForegroundColor Yellow
    
    # Альтернатива: используем встроенный SSH с ключом
    Write-Host "Создаем директорию на сервере..." -ForegroundColor Yellow
    ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR"
    
    Write-Host "Копируем файлы (требует пароль)..." -ForegroundColor Yellow
    scp -r app/dist/* $SERVER_USER@$SERVER_IP`:$REMOTE_DIR/app/
    scp -r owner/dist/* $SERVER_USER@$SERVER_IP`:$REMOTE_DIR/owner/
    scp -r cashier/dist/* $SERVER_USER@$SERVER_IP`:$REMOTE_DIR/cashier/
}

# Настраиваем nginx
Write-Host "⚙️  Настраиваем nginx..." -ForegroundColor Green

$nginxConfig = @"
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        root /var/www/loyverse/app;
        try_files `$uri `$uri/ /index.html;
    }

    location /owner {
        alias /var/www/loyverse/owner;
        try_files `$uri `$uri/ /owner/index.html;
    }

    location /cashier {
        alias /var/www/loyverse/cashier;
        try_files `$uri `$uri/ /cashier/index.html;
    }
}
"@

# Сохраняем конфигурацию во временный файл
$nginxConfig | Out-File -FilePath nginx-temp.conf -Encoding UTF8

# Загружаем конфигурацию на сервер
if ($useSSHPass) {
    pscp -pw $SERVER_PASSWORD nginx-temp.conf $SERVER_USER@$SERVER_IP`:/tmp/loyverse-nginx.conf
} else {
    scp nginx-temp.conf $SERVER_USER@$SERVER_IP`:/tmp/loyverse-nginx.conf
}

# Настраиваем nginx на сервере
$setupScript = @"
apt-get update
apt-get install -y nginx
mkdir -p $REMOTE_DIR
mv /tmp/loyverse-nginx.conf /etc/nginx/sites-available/loyverse
ln -sf /etc/nginx/sites-available/loyverse /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx || service nginx reload
"@

Write-Host "Выполняем настройку nginx на сервере..." -ForegroundColor Yellow
if ($useSSHPass) {
    echo $setupScript | plink -ssh -pw $SERVER_PASSWORD $SERVER_USER@$SERVER_IP
} else {
    ssh $SERVER_USER@$SERVER_IP $setupScript
}

# Удаляем временный файл
Remove-Item nginx-temp.conf -ErrorAction SilentlyContinue

Write-Host "✅ Деплой завершен!" -ForegroundColor Green
Write-Host "🌐 Приложения доступны по адресам:" -ForegroundColor Green
Write-Host "   Основное: http://$DOMAIN/" -ForegroundColor Cyan
Write-Host "   Владелец: http://$DOMAIN/owner" -ForegroundColor Cyan
Write-Host "   Кассир: http://$DOMAIN/cashier" -ForegroundColor Cyan
