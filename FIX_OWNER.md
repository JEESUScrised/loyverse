# Исправление проблемы с owner приложением

## Проблема: Страница owner загружается, но контент не отображается

### Шаг 1: Проверьте что файлы owner загружены

Выполните на сервере:

```bash
# Проверьте наличие файлов
ls -la /var/www/loyverse/owner/
ls -la /var/www/loyverse/owner/assets/

# Должны быть:
# - index.html
# - assets/ с JS и CSS файлами
```

### Шаг 2: Проверьте содержимое index.html owner

```bash
cat /var/www/loyverse/owner/index.html | head -20
```

Проверьте, что пути к статическим файлам правильные (должны начинаться с `/owner/assets/`).

### Шаг 3: Исправьте конфигурацию nginx

Проблема может быть в том, что статические файлы owner ищутся не в том месте. Обновите конфигурацию:

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
        access_log off;
    }

    # Приложение владельца
    location /owner {
        alias /var/www/loyverse/owner;
        try_files $uri $uri/ /owner/index.html;
        index index.html;
    }

    # Статические файлы для owner (ВАЖНО: без завершающего слеша в location)
    location /owner/assets/ {
        alias /var/www/loyverse/owner/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Приложение кассира
    location /cashier {
        alias /var/www/loyverse/cashier;
        try_files $uri $uri/ /cashier/index.html;
        index index.html;
    }

    # Статические файлы для cashier
    location /cashier/assets/ {
        alias /var/www/loyverse/cashier/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Общие статические файлы (fallback для изображений)
    location ~* \.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$ {
        root /var/www/loyverse;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
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
# Смотрите ошибки в реальном времени
tail -f /var/log/nginx/error.log

# Или проверьте последние ошибки
tail -20 /var/log/nginx/error.log
```

### Шаг 5: Проверьте доступность файлов

```bash
# Проверьте что файлы доступны через nginx
curl -I http://localhost/owner/
curl -I http://localhost/owner/assets/index-*.js
```

## Если файлы owner не загружены

1. **Локально соберите owner:**
```powershell
cd owner
npm install
npm run build
```

2. **Загрузите через WinSCP или scp:**
   - `owner/dist/*` → `/var/www/loyverse/owner/`

3. **Установите права:**
```bash
chmod -R 755 /var/www/loyverse/owner
chown -R www-data:www-data /var/www/loyverse/owner
```

## Альтернативное решение: Использовать root вместо alias

Если проблема сохраняется, попробуйте использовать `root` вместо `alias`:

```bash
cat > /etc/nginx/sites-available/loyverse << 'EOF'
server {
    listen 80;
    server_name jeesuscrised.ru www.jeesuscrised.ru;

    # Основное приложение
    location / {
        root /var/www/loyverse/app;
        try_files $uri $uri/ /index.html;
    }

    # Приложение владельца
    location /owner/ {
        root /var/www/loyverse;
        try_files $uri $uri/ /owner/index.html;
    }

    # Приложение кассира
    location /cashier/ {
        root /var/www/loyverse;
        try_files $uri $uri/ /cashier/index.html;
    }
}
EOF

nginx -t && systemctl reload nginx
```
