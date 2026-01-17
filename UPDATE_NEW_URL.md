# ✅ Обновление на новый URL Cloudflare Tunnel

## Ваш новый URL:
**https://comfortable-compiled-require-national.trycloudflare.com**

## Что уже сделано:

### ✅ `shared/config.js` обновлен
API URL установлен на: `https://comfortable-compiled-require-national.trycloudflare.com/api`

## Что нужно сделать:

### 1. Обновите `backend/.env`

Откройте `backend/.env` и замените URL:

```env
CLIENT_APP_URL=https://comfortable-compiled-require-national.trycloudflare.com/app
OWNER_APP_URL=https://comfortable-compiled-require-national.trycloudflare.com/owner
CASHIER_APP_URL=https://comfortable-compiled-require-national.trycloudflare.com/cashier
```

### 2. Перезапустите бэкенд (если запущен)

```powershell
# Остановите бэкенд (Ctrl+C)
# Затем запустите заново:
cd backend
npm start
```

### 3. Настройте Mini Apps в Telegram

```powershell
cd backend
npm run setup-mini-apps
```

Это обновит URL в Telegram для всех трех ботов.

### 4. Проверьте результат

После выполнения `setup-mini-apps` вы должны увидеть:
```
✅ Клиентский бот: Mini App настроен успешно
   URL: https://comfortable-compiled-require-national.trycloudflare.com/app
✅ Бот владельца: Mini App настроен успешно
   URL: https://comfortable-compiled-require-national.trycloudflare.com/owner
✅ Бот кассира: Mini App настроен успешно
   URL: https://comfortable-compiled-require-national.trycloudflare.com/cashier
```

### 5. Попробуйте открыть приложение в Telegram

Теперь должно работать без пароля! 🎉

---

## ⚠️ Важно

- Убедитесь, что прокси запущен на порту **8081**
- Убедитесь, что Cloudflare Tunnel направлен на порт **8081**
- URL от Cloudflare Tunnel меняется при каждом перезапуске
- Если перезапустите `cloudflared`, получите новый URL
- Нужно будет снова обновить `.env` и запустить `setup-mini-apps`

## 🔍 Проверка работы

Проверьте, что все работает:

```powershell
# API
curl https://comfortable-compiled-require-national.trycloudflare.com/api/venues

# App
curl https://comfortable-compiled-require-national.trycloudflare.com/app/
```

Оба должны вернуть успешный ответ (не 404).
