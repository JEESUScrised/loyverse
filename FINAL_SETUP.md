# ✅ Финальная настройка с новым URL

## Ваш новый URL:
**https://turns-bloomberg-greatest-caused.trycloudflare.com**

## Что уже сделано:

### ✅ `shared/config.js` обновлен
API URL установлен на: `https://turns-bloomberg-greatest-caused.trycloudflare.com/api`

## Что нужно сделать:

### 1. Обновите `backend/.env`

Откройте `backend/.env` и замените URL:

```env
CLIENT_APP_URL=https://turns-bloomberg-greatest-caused.trycloudflare.com/app
OWNER_APP_URL=https://turns-bloomberg-greatest-caused.trycloudflare.com/owner
CASHIER_APP_URL=https://turns-bloomberg-greatest-caused.trycloudflare.com/cashier
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
   URL: https://turns-bloomberg-greatest-caused.trycloudflare.com/app
✅ Бот владельца: Mini App настроен успешно
   URL: https://turns-bloomberg-greatest-caused.trycloudflare.com/owner
✅ Бот кассира: Mini App настроен успешно
   URL: https://turns-bloomberg-greatest-caused.trycloudflare.com/cashier
```

### 5. Попробуйте открыть приложение в Telegram

Теперь должно работать! 🎉

---

## ⚠️ Важно

- Убедитесь, что прокси запущен на порту **8082**
- Убедитесь, что Cloudflare Tunnel направлен на порт **8082**
- URL от Cloudflare Tunnel меняется при каждом перезапуске
- Если перезапустите `cloudflared`, получите новый URL
- Нужно будет снова обновить `.env` и запустить `setup-mini-apps`

## 🔍 Проверка работы

Проверьте, что все работает:

```powershell
# Test endpoint
curl https://turns-bloomberg-greatest-caused.trycloudflare.com/test

# API
curl https://turns-bloomberg-greatest-caused.trycloudflare.com/api/venues

# App
curl https://turns-bloomberg-greatest-caused.trycloudflare.com/app/
```

Все должны вернуть успешный ответ (не 404).

## 📋 Текущая конфигурация

- **Прокси порт:** 8082
- **Backend порт:** 3004
- **App порт:** 3000
- **Cloudflare Tunnel URL:** https://turns-bloomberg-greatest-caused.trycloudflare.com
