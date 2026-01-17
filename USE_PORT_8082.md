# 🔧 Использование порта 8082 для прокси

## Проблема
Порт 8081 занят процессом DivineVPN, поэтому прокси не может запуститься.

## Решение
Прокси теперь настроен на порт **8082**.

## Что нужно сделать:

### 1. Убедитесь, что прокси запущен на порту 8082

```powershell
cd C:\Users\user\Desktop\Loyverse
$env:PROXY_PORT=8082
node proxy-server-express.js
```

### 2. Остановите текущий Cloudflare Tunnel (если запущен)

Нажмите Ctrl+C в терминале, где запущен cloudflared.

### 3. Запустите Cloudflare Tunnel для порта 8082

```powershell
C:\Users\user\cloudflared\cloudflared.exe tunnel --url http://localhost:8082
```

### 4. Скопируйте новый URL

Например: `https://new-url.trycloudflare.com`

### 5. Обновите `backend/.env`

```env
CLIENT_APP_URL=https://new-url.trycloudflare.com/app
OWNER_APP_URL=https://new-url.trycloudflare.com/owner
CASHIER_APP_URL=https://new-url.trycloudflare.com/cashier
```

### 6. Обновите `shared/config.js`

```javascript
baseURL: 'https://new-url.trycloudflare.com/api'
```

### 7. Настройте Mini Apps

```powershell
cd backend
npm run setup-mini-apps
```

---

## ⚠️ Важно

- Прокси теперь по умолчанию использует порт **8082**
- Cloudflare Tunnel должен быть направлен на порт **8082**
- Если DivineVPN продолжает занимать порт 8081, можно оставить его как есть

## 🔍 Проверка работы

После настройки проверьте:

```powershell
# Локально
curl http://localhost:8082/test

# Через туннель
curl https://your-url.trycloudflare.com/test
```

Оба должны вернуть JSON с сообщением "Proxy is working".
