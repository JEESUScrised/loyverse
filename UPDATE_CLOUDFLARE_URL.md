# ✅ Обновление URL Cloudflare Tunnel

## Ваш новый URL:
**https://exhibits-exploring-seeking-against.trycloudflare.com**

## Что нужно сделать:

### 1. Обновите `backend/.env`

Откройте `backend/.env` и замените URL:

```env
CLIENT_APP_URL=https://exhibits-exploring-seeking-against.trycloudflare.com/app
OWNER_APP_URL=https://exhibits-exploring-seeking-against.trycloudflare.com/owner
CASHIER_APP_URL=https://exhibits-exploring-seeking-against.trycloudflare.com/cashier
```

### 2. `shared/config.js` уже обновлен ✅

API URL уже установлен на: `https://exhibits-exploring-seeking-against.trycloudflare.com/api`

### 3. Перезапустите бэкенд (если запущен)

```powershell
# Остановите бэкенд (Ctrl+C)
# Затем запустите заново:
cd backend
npm start
```

### 4. Настройте Mini Apps в Telegram

```powershell
cd backend
npm run setup-mini-apps
```

Это обновит URL в Telegram для всех трех ботов.

### 5. Проверьте результат

После выполнения `setup-mini-apps` вы должны увидеть:
```
✅ Клиентский бот: Mini App настроен успешно
   URL: https://exhibits-exploring-seeking-against.trycloudflare.com/app
✅ Бот владельца: Mini App настроен успешно
   URL: https://exhibits-exploring-seeking-against.trycloudflare.com/owner
✅ Бот кассира: Mini App настроен успешно
   URL: https://exhibits-exploring-seeking-against.trycloudflare.com/cashier
```

### 6. Попробуйте открыть приложение в Telegram

Теперь должно работать без пароля! 🎉

---

## ⚠️ Важно

- URL от Cloudflare Tunnel меняется при каждом перезапуске
- Если перезапустите `cloudflared`, получите новый URL
- Нужно будет снова обновить `.env` и запустить `setup-mini-apps`

## 💡 Для постоянного URL

Если нужен фиксированный URL, можно:
1. Создать аккаунт Cloudflare (бесплатно)
2. Настроить именованный туннель (named tunnel)
3. Использовать свой домен

Но для тестирования текущий вариант отлично подходит!
