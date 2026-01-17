# 🔧 Исправление ошибки 404 на прокси

## Проблема
Прокси-сервер возвращает 404 ошибку для всех запросов.

## Решение

### Вариант 1: Использовать другой порт (8081)

Прокси теперь настроен на порт **8081** вместо 8080.

**Шаги:**

1. **Остановите Cloudflare Tunnel** (если запущен)

2. **Запустите прокси на порту 8081:**
   ```powershell
   cd C:\Users\user\Desktop\Loyverse
   $env:PROXY_PORT=8081
   node proxy-server-express.js
   ```

3. **Запустите Cloudflare Tunnel для порта 8081:**
   ```powershell
   C:\Users\user\cloudflared\cloudflared.exe tunnel --url http://localhost:8081
   ```

4. **Скопируйте новый URL** (например: `https://new-url.trycloudflare.com`)

5. **Обновите `backend/.env`:**
   ```env
   CLIENT_APP_URL=https://new-url.trycloudflare.com/app
   OWNER_APP_URL=https://new-url.trycloudflare.com/owner
   CASHIER_APP_URL=https://new-url.trycloudflare.com/cashier
   ```

6. **Обновите `shared/config.js`:**
   ```javascript
   baseURL: 'https://new-url.trycloudflare.com/api'
   ```

7. **Настройте Mini Apps:**
   ```powershell
   cd backend
   npm run setup-mini-apps
   ```

### Вариант 2: Остановить конфликтующий процесс на порту 8080

Если хотите использовать порт 8080:

1. **Найдите процесс, занимающий порт 8080:**
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 8080 -State Listen).OwningProcess
   ```

2. **Остановите его:**
   ```powershell
   Stop-Process -Id <PID> -Force
   ```

3. **Запустите прокси:**
   ```powershell
   cd C:\Users\user\Desktop\Loyverse
   node proxy-server-express.js
   ```

---

## ⚠️ Важно

- Убедитесь, что прокси запущен **ПЕРЕД** запуском Cloudflare Tunnel
- Проверьте, что бэкенд работает на порту 3004
- Проверьте, что app работает на порту 3000

## 🔍 Проверка работы

После настройки проверьте:

```powershell
# Локально
curl http://localhost:8081/test

# Через туннель
curl https://your-url.trycloudflare.com/test
```

Оба должны вернуть JSON с сообщением "Proxy is working".
