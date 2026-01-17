# Использование прокси-сервера для одного ngrok туннеля

## Шаг 1: Остановите текущий ngrok

Нажмите `Ctrl+C` в терминале, где запущен ngrok, или закройте процесс.

## Шаг 2: Запустите все сервисы

**Терминал 1 - Backend:**
```powershell
cd C:\Users\user\Desktop\Loyverse\backend
npm start
```

**Терминал 2 - App:**
```powershell
cd C:\Users\user\Desktop\Loyverse\app
npm run dev
```

**Терминал 3 - Owner:**
```powershell
cd C:\Users\user\Desktop\Loyverse\owner
npm run dev
```

**Терминал 4 - Cashier:**
```powershell
cd C:\Users\user\Desktop\Loyverse\cashier
npm run dev
```

**Терминал 5 - Прокси-сервер:**
```powershell
cd C:\Users\user\Desktop\Loyverse
node proxy-server.js
```

## Шаг 3: Запустите ngrok для прокси

**Терминал 6 - ngrok:**
```powershell
& "$env:USERPROFILE\ngrok\ngrok.exe" http 8080
```

Скопируйте HTTPS URL (например: `https://abc123.ngrok-free.dev`)

## Шаг 4: Обновите .env

В `backend/.env`:
```env
CLIENT_APP_URL=https://abc123.ngrok-free.dev/app
OWNER_APP_URL=https://abc123.ngrok-free.dev/owner
CASHIER_APP_URL=https://abc123.ngrok-free.dev/cashier
```

## Шаг 5: Обновите API URL в frontend

В `shared/config.js` временно:
```javascript
baseURL: 'https://abc123.ngrok-free.dev/api'
```

Или через переменные окружения в каждом frontend:
```env
VITE_API_URL=https://abc123.ngrok-free.dev/api
```

## Шаг 6: Настройте Mini Apps

```powershell
cd C:\Users\user\Desktop\Loyverse\backend
npm run setup-mini-apps
```

## Готово! 🎉

Теперь все приложения доступны через один ngrok URL:
- App: `https://abc123.ngrok-free.dev/app`
- Owner: `https://abc123.ngrok-free.dev/owner`
- Cashier: `https://abc123.ngrok-free.dev/cashier`
- API: `https://abc123.ngrok-free.dev/api`
