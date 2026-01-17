# 🔄 Обновление URL туннеля

Ваш туннель работает: `https://pretty-times-try.loca.lt`

## Шаги для настройки:

### 1. Обновите `backend/.env`

Откройте `backend/.env` и замените URL:

```env
CLIENT_APP_URL=https://pretty-times-try.loca.lt/app
OWNER_APP_URL=https://pretty-times-try.loca.lt/owner
CASHIER_APP_URL=https://pretty-times-try.loca.lt/cashier
```

### 2. Обновите `shared/config.js` (уже сделано)

URL API уже обновлен на: `https://pretty-times-try.loca.lt/api`

### 3. Убедитесь, что прокси-сервер запущен

```powershell
cd C:\Users\user\Desktop\Loyverse
node proxy-server-express.js
```

### 4. Настройте Mini Apps

```powershell
cd backend
npm run setup-mini-apps
```

### 5. Проверьте работу

- Откройте в браузере: `https://pretty-times-try.loca.lt/app/`
- Должно открыться клиентское приложение

## ⚠️ Важно

- URL от localtunnel меняется при каждом перезапуске
- Если перезапустите `lt --port 8080`, получите новый URL
- Обновите `.env` файлы при каждом новом URL

## 🔧 Если нужно сохранить URL

Используйте Cloudflare Tunnel (см. `NGROK_ALTERNATIVES.md`) - там можно получить более стабильный URL.
