# Исправление ошибки nginx

Если вы получили ошибку:
```
Job for nginx.service failed because the control process exited with error code.
```

Выполните следующие команды на сервере:

## Шаг 1: Проверьте ошибки конфигурации

```bash
nginx -t
```

Это покажет точную ошибку в конфигурации.

## Шаг 2: Просмотрите логи

```bash
journalctl -xeu nginx.service --no-pager | tail -30
```

## Шаг 3: Исправьте конфигурацию

Создайте правильную конфигурацию:

```bash
cat > /etc/nginx/sites-available/loyverse << 'EOF'
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
    location /owner/ {
        alias /var/www/loyverse/owner/;
        try_files $uri $uri/ /owner/index.html;
        index index.html;
    }

    # Приложение кассира
    location /cashier/ {
        alias /var/www/loyverse/cashier/;
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
EOF
```

## Шаг 4: Проверьте конфигурацию

```bash
nginx -t
```

Должно быть: `nginx: configuration file /etc/nginx/nginx.conf test is successful`

## Шаг 5: Перезапустите nginx

```bash
systemctl restart nginx
```

## Шаг 6: Проверьте статус

```bash
systemctl status nginx
```

## Частые ошибки:

### 1. Ошибка "alias" в location без завершающего слеша

**Неправильно:**
```nginx
location /owner {
    alias /var/www/loyverse/owner;
}
```

**Правильно:**
```nginx
location /owner/ {
    alias /var/www/loyverse/owner/;
}
```

### 2. Отсутствует директория

```bash
mkdir -p /var/www/loyverse/app
mkdir -p /var/www/loyverse/owner
mkdir -p /var/www/loyverse/cashier
chmod -R 755 /var/www/loyverse
```

### 3. Конфликт с другой конфигурацией

```bash
# Удалите дефолтную конфигурацию
rm -f /etc/nginx/sites-enabled/default

# Убедитесь, что только наша конфигурация активна
ls -la /etc/nginx/sites-enabled/
```

### 4. Проблемы с правами доступа

```bash
chown -R www-data:www-data /var/www/loyverse
chmod -R 755 /var/www/loyverse
```

## Если ничего не помогает:

1. Проверьте, что nginx установлен:
```bash
which nginx
nginx -v
```

2. Проверьте, что порт 80 свободен:
```bash
netstat -tulpn | grep :80
```

3. Переустановите nginx:
```bash
apt-get remove --purge nginx nginx-common
apt-get install nginx
```
