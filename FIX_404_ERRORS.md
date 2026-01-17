# Исправление ошибок 404

## Проблема: Файлы не загружаются (404)

### Шаг 1: Проверьте что файлы загружены на сервер

Выполните на сервере:

```bash
# Проверьте наличие файлов
ls -la /var/www/loyverse/app/
ls -la /var/www/loyverse/owner/
ls -la /var/www/loyverse/cashier/

# Должны быть файлы index.html и папка assets/
```

### Шаг 2: Проверьте права доступа

```bash
chmod -R 755 /var/www/loyverse
chown -R www-data:www-data /var/www/loyverse
```

### Шаг 3: Исправьте конфигурацию nginx для статических файлов

Проблема в том, что статические файлы (JS, CSS) ищутся не в том месте. Исправьте конфигурацию:

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

    # Статические файлы для основного приложения
    location /assets/ {
        alias /var/www/loyverse/app/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Приложение владельца
    location /owner/ {
        alias /var/www/loyverse/owner/;
        try_files $uri $uri/ /owner/index.html;
        index index.html;
    }

    # Статические файлы для owner
    location /owner/assets/ {
        alias /var/www/loyverse/owner/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Приложение кассира
    location /cashier/ {
        alias /var/www/loyverse/cashier/;
        try_files $uri $uri/ /cashier/index.html;
        index index.html;
    }

    # Статические файлы для cashier
    location /cashier/assets/ {
        alias /var/www/loyverse/cashier/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Общие статические файлы (fallback)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/loyverse;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Проверьте конфигурацию
nginx -t

# Перезагрузите nginx
systemctl reload nginx
```

### Шаг 4: Проверьте логи nginx

```bash
tail -f /var/log/nginx/error.log
```

### Шаг 5: Проверьте что index.html существует

```bash
cat /var/www/loyverse/app/index.html | head -20
cat /var/www/loyverse/owner/index.html | head -20
cat /var/www/loyverse/cashier/index.html | head -20
```

## Если файлы не загружены

Загрузите файлы заново:

1. **Локально соберите приложения:**
```powershell
cd app; npm run build
cd ..\owner; npm run build
cd ..\cashier; npm run build
```

2. **Загрузите через WinSCP или scp:**
   - `app/dist/*` → `/var/www/loyverse/app/`
   - `owner/dist/*` → `/var/www/loyverse/owner/`
   - `cashier/dist/*` → `/var/www/loyverse/cashier/`

3. **Проверьте структуру:**
```bash
# Должна быть такая структура:
/var/www/loyverse/app/index.html
/var/www/loyverse/app/assets/index-*.js
/var/www/loyverse/app/assets/index-*.css
```

## Быстрое исправление одной командой

```bash
# На сервере выполните:
cat > /etc/nginx/sites-available/loyverse << 'EOF'
server {
    listen 80;
    server_name jeesuscrised.ru www.jeesuscrised.ru;
    root /var/www/loyverse;
    index index.html;

    location / {
        try_files $uri $uri/ /app/index.html;
    }

    location /owner/ {
        alias /var/www/loyverse/owner/;
        try_files $uri $uri/ /owner/index.html;
    }

    location /cashier/ {
        alias /var/www/loyverse/cashier/;
        try_files $uri $uri/ /cashier/index.html;
    }
}
EOF

nginx -t && systemctl reload nginx
```
