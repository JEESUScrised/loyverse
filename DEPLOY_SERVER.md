# Деплой на сервер

## Быстрый деплой

### Вариант 1: Автоматический деплой (рекомендуется)

Просто запустите скрипт:

```bash
chmod +x deploy.sh
./deploy.sh
```

Скрипт автоматически:
1. Соберет все 3 приложения
2. Загрузит их на сервер
3. Настроит nginx
4. Перезапустит nginx

### Вариант 2: Ручной деплой

#### Шаг 1: Сборка приложений

```bash
chmod +x build-all.sh
./build-all.sh
```

#### Шаг 2: Загрузка на сервер

```bash
# Установите sshpass если нужно
# Linux: sudo apt-get install sshpass
# Mac: brew install hudochenkov/sshpass/sshpass

# Загрузите файлы
sshpass -p "PUR42mjSai" scp -r app/dist owner/dist cashier/dist root@149.33.4.37:/var/www/loyverse/
```

#### Шаг 3: Настройка nginx на сервере

Подключитесь к серверу:
```bash
sshpass -p "PUR42mjSai" ssh root@149.33.4.37
```

На сервере выполните:

```bash
# Установите nginx если не установлен
apt-get update
apt-get install -y nginx

# Создайте директорию
mkdir -p /var/www/loyverse

# Скопируйте конфигурацию nginx
cat > /etc/nginx/sites-available/loyverse << 'EOF'
server {
    listen 80;
    server_name jeesuscrised.ru www.jeesuscrised.ru;

    location / {
        root /var/www/loyverse/app;
        try_files $uri $uri/ /index.html;
    }

    location /owner {
        alias /var/www/loyverse/owner;
        try_files $uri $uri/ /owner/index.html;
    }

    location /cashier {
        alias /var/www/loyverse/cashier;
        try_files $uri $uri/ /cashier/index.html;
    }
}
EOF

# Активируйте конфигурацию
ln -sf /etc/nginx/sites-available/loyverse /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
nginx -t

# Перезагрузите nginx
systemctl reload nginx
```

## Доступ к приложениям

После деплоя приложения будут доступны по адресам:

- **Основное приложение**: http://jeesuscrised.ru/
- **Приложение владельца**: http://jeesuscrised.ru/owner
- **Приложение кассира**: http://jeesuscrised.ru/cashier

## Настройка HTTPS (опционально)

Для настройки HTTPS используйте Let's Encrypt:

```bash
# На сервере
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d jeesuscrised.ru -d www.jeesuscrised.ru
```

## Обновление приложений

Для обновления просто запустите скрипт деплоя снова:

```bash
./deploy.sh
```

## Устранение проблем

### Если nginx не запускается

```bash
# Проверьте конфигурацию
nginx -t

# Проверьте логи
tail -f /var/log/nginx/error.log

# Перезапустите nginx
systemctl restart nginx
```

### Если приложения не открываются

1. Проверьте права доступа:
```bash
chmod -R 755 /var/www/loyverse
```

2. Проверьте, что файлы загружены:
```bash
ls -la /var/www/loyverse/
```

3. Проверьте конфигурацию nginx:
```bash
cat /etc/nginx/sites-available/loyverse
```
