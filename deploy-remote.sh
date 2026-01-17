#!/bin/bash
# Скрипт для выполнения на сервере после загрузки файлов

SERVER_IP="149.33.4.37"
SERVER_USER="root"
DOMAIN="jeesuscrised.ru"
REMOTE_DIR="/var/www/loyverse"

echo "⚙️  Настраиваем nginx на сервере..."

ssh $SERVER_USER@$SERVER_IP << ENDSSH
# Устанавливаем nginx если не установлен
if ! command -v nginx &> /dev/null; then
    apt-get update
    apt-get install -y nginx
fi

# Создаем директорию если не существует
mkdir -p $REMOTE_DIR

# Создаем конфигурацию nginx
cat > /etc/nginx/sites-available/loyverse << 'NGINXCONF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Основное приложение
    location / {
        root /var/www/loyverse/app;
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }

    # Приложение владельца
    location /owner {
        alias /var/www/loyverse/owner;
        try_files \$uri \$uri/ /owner/index.html;
        index index.html;
    }

    # Приложение кассира
    location /cashier {
        alias /var/www/loyverse/cashier;
        try_files \$uri \$uri/ /cashier/index.html;
        index index.html;
    }

    # Статические файлы
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/loyverse;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXCONF

# Активируем конфигурацию
ln -sf /etc/nginx/sites-available/loyverse /etc/nginx/sites-enabled/

# Удаляем дефолтную конфигурацию
rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
nginx -t

# Перезагружаем nginx
systemctl reload nginx || service nginx reload

# Устанавливаем права доступа
chmod -R 755 $REMOTE_DIR

echo "✅ Nginx настроен и перезагружен"
echo "🌐 Приложения доступны:"
echo "   - http://$DOMAIN/"
echo "   - http://$DOMAIN/owner"
echo "   - http://$DOMAIN/cashier"
ENDSSH

echo "✅ Готово!"
