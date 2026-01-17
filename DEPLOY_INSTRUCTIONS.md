# 🚀 Инструкция по деплою на сервер

## Данные сервера
- **IP**: 149.33.4.37
- **Пользователь**: root
- **Пароль**: PUR42mjSai
- **Домен**: jeesuscrised.ru

## Быстрый деплой (3 шага)

### Шаг 1: Сборка приложений

Выполните в терминале (PowerShell или CMD):

```powershell
# App
cd app
npm install
npm run build
cd ..

# Owner  
cd owner
npm install
npm run build
cd ..

# Cashier
cd cashier
npm install
npm run build
cd ..
```

После сборки у вас будут папки:
- `app/dist/`
- `owner/dist/`
- `cashier/dist/`

### Шаг 2: Загрузка файлов на сервер

**Вариант A: WinSCP (рекомендуется для Windows)**

1. Скачайте WinSCP: https://winscp.net/
2. Подключитесь:
   - Хост: `149.33.4.37`
   - Пользователь: `root`
   - Пароль: `PUR42mjSai`
   - Протокол: SFTP
3. Создайте папку `/var/www/loyverse` на сервере
4. Загрузите:
   - `app/dist/*` → `/var/www/loyverse/app/`
   - `owner/dist/*` → `/var/www/loyverse/owner/`
   - `cashier/dist/*` → `/var/www/loyverse/cashier/`

**Вариант B: PowerShell (требует ручного ввода пароля)**

```powershell
# Создайте директорию
ssh root@149.33.4.37 "mkdir -p /var/www/loyverse"

# Загрузите файлы (введите пароль: PUR42mjSai)
scp -r app/dist/* root@149.33.4.37:/var/www/loyverse/app/
scp -r owner/dist/* root@149.33.4.37:/var/www/loyverse/owner/
scp -r cashier/dist/* root@149.33.4.37:/var/www/loyverse/cashier/
```

### Шаг 3: Настройка Nginx

Подключитесь к серверу:
```powershell
ssh root@149.33.4.37
# Пароль: PUR42mjSai
```

На сервере выполните:

```bash
# Установите nginx
apt-get update
apt-get install -y nginx

# Создайте конфигурацию (исправленная версия)
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

# Активируйте конфигурацию
ln -sf /etc/nginx/sites-available/loyverse /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
nginx -t

# Перезагрузите nginx
systemctl reload nginx

# Установите права
chmod -R 755 /var/www/loyverse
```

## ✅ Готово!

Приложения доступны:
- **Основное**: http://jeesuscrised.ru/
- **Владелец**: http://jeesuscrised.ru/owner
- **Кассир**: http://jeesuscrised.ru/cashier

## Обновление

Для обновления просто повторите Шаги 1-2 (сборка и загрузка).

## Настройка HTTPS (опционально)

```bash
# На сервере
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d jeesuscrised.ru -d www.jeesuscrised.ru
```

## Устранение проблем

### Приложения не открываются

1. Проверьте права:
```bash
chmod -R 755 /var/www/loyverse
```

2. Проверьте логи:
```bash
tail -f /var/log/nginx/error.log
```

3. Перезапустите nginx:
```bash
systemctl restart nginx
```

4. Проверьте файлы:
```bash
ls -la /var/www/loyverse/app/
ls -la /var/www/loyverse/owner/
ls -la /var/www/loyverse/cashier/
```
