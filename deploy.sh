#!/bin/bash

# Конфигурация сервера
SERVER_IP="149.33.4.37"
SERVER_USER="root"
SERVER_PASSWORD="PUR42mjSai"
DOMAIN="jeesuscrised.ru"
REMOTE_DIR="/var/www/loyverse"

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Начинаем деплой Loyverse приложений${NC}"

# Проверяем наличие sshpass
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}Устанавливаем sshpass...${NC}"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y sshpass
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    else
        echo -e "${RED}Пожалуйста, установите sshpass вручную${NC}"
        exit 1
    fi
fi

# Собираем все приложения
echo -e "${GREEN}📦 Собираем приложения...${NC}"

echo -e "${YELLOW}Сборка app...${NC}"
cd app
npm install
npm run build
cd ..

echo -e "${YELLOW}Сборка owner...${NC}"
cd owner
npm install
npm run build
cd ..

echo -e "${YELLOW}Сборка cashier...${NC}"
cd cashier
npm install
npm run build
cd ..

# Создаем временную директорию для деплоя
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}Создаем временную директорию: $TEMP_DIR${NC}"

# Копируем собранные приложения
cp -r app/dist $TEMP_DIR/app
cp -r owner/dist $TEMP_DIR/owner
cp -r cashier/dist $TEMP_DIR/cashier

# Копируем конфигурацию nginx
cp nginx.conf $TEMP_DIR/

# Загружаем на сервер
echo -e "${GREEN}📤 Загружаем файлы на сервер...${NC}"

# Создаем директорию на сервере
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR"

# Копируем файлы
sshpass -p "$SERVER_PASSWORD" scp -r -o StrictHostKeyChecking=no $TEMP_DIR/* $SERVER_USER@$SERVER_IP:$REMOTE_DIR/

# Настраиваем nginx
echo -e "${GREEN}⚙️  Настраиваем nginx...${NC}"

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
# Устанавливаем nginx если не установлен
if ! command -v nginx &> /dev/null; then
    apt-get update
    apt-get install -y nginx
fi

# Создаем конфигурацию nginx
cat > /etc/nginx/sites-available/loyverse << 'NGINXCONF'
server {
    listen 80;
    server_name jeesuscrised.ru www.jeesuscrised.ru;

    # Основное приложение
    location / {
        root /var/www/loyverse/app;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Приложение владельца
    location /owner {
        alias /var/www/loyverse/owner;
        try_files $uri $uri/ /owner/index.html;
        index index.html;
    }

    # Приложение кассира
    location /cashier {
        alias /var/www/loyverse/cashier;
        try_files $uri $uri/ /cashier/index.html;
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

# Удаляем дефолтную конфигурацию если есть
rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию nginx
nginx -t

# Перезагружаем nginx
systemctl reload nginx || service nginx reload

echo "✅ Nginx настроен и перезагружен"
ENDSSH

# Очищаем временную директорию
rm -rf $TEMP_DIR

echo -e "${GREEN}✅ Деплой завершен!${NC}"
echo -e "${GREEN}🌐 Приложения доступны по адресам:${NC}"
echo -e "   Основное: http://$DOMAIN/"
echo -e "   Владелец: http://$DOMAIN/owner"
echo -e "   Кассир: http://$DOMAIN/cashier"
