# 🔧 Исправление старого URL в Telegram

## Проблема
Telegram пытается открыть приложение по старому URL от ngrok (`nonodoriferously-experienceless-valencia.ngrok-free.dev`), который больше не работает.

## Решение

### 1. Обновите `backend/.env`

Откройте `backend/.env` и замените URL на новый от Cloudflare Tunnel:

```env
CLIENT_APP_URL=https://turns-bloomberg-greatest-caused.trycloudflare.com/app
OWNER_APP_URL=https://turns-bloomberg-greatest-caused.trycloudflare.com/owner
CASHIER_APP_URL=https://turns-bloomberg-greatest-caused.trycloudflare.com/cashier
```

**Важно:** Убедитесь, что вы заменили ВСЕ старые URL от ngrok на новые от Cloudflare Tunnel.

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

### 5. Попробуйте открыть приложение в Telegram снова

Теперь должно работать! 🎉

---

## ⚠️ Важно

- Убедитесь, что прокси запущен на порту **8082**
- Убедитесь, что Cloudflare Tunnel направлен на порт **8082**
- Убедитесь, что в `backend/.env` НЕТ старых URL от ngrok
- `shared/config.js` уже обновлен на новый URL ✅

## 🔍 Проверка

Проверьте, что в `backend/.env` нет упоминаний:
- ❌ `ngrok-free.dev`
- ❌ `nonodoriferously-experienceless-valencia`
- ❌ Старые URL от ngrok

Должны быть только:
- ✅ `trycloudflare.com`
- ✅ `turns-bloomberg-greatest-caused`
