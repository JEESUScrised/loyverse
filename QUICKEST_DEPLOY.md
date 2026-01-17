# ⚡ Самый быстрый деплой (2 минуты)

## 🎯 Рекомендуется: Localtunnel (проще чем ngrok)

См. `NGROK_ALTERNATIVES.md` для всех вариантов.

**Быстрый старт:**
```powershell
npm install -g localtunnel
# Запустите прокси: node proxy-server-express.js
# В другом терминале: lt --port 8080
```

---

## Вариант: ngrok для тестирования

### Шаг 1: Установите ngrok

**Windows:**
```powershell
# Через chocolatey
choco install ngrok

# Или скачайте с https://ngrok.com/download
```

**Mac:**
```bash
brew install ngrok
```

**Linux:**
```bash
# Скачайте с https://ngrok.com/download
# Или через snap
snap install ngrok
```

### Шаг 2: Зарегистрируйтесь (бесплатно)

1. Зайдите на https://ngrok.com
2. Зарегистрируйтесь
3. Скопируйте authtoken из dashboard

### Шаг 3: Настройте ngrok

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Шаг 4: Запустите приложения

**Терминал 1 - Backend:**
```bash
cd backend
npm start
```

**Терминал 2 - ngrok для backend:**
```bash
ngrok http 3004
```
Скопируйте HTTPS URL (например: `https://abc123.ngrok-free.app`)

**Терминал 3 - App (клиентское):**
```bash
cd app
npm run dev
```

**Терминал 4 - ngrok для app:**
```bash
ngrok http 5173
```
Скопируйте HTTPS URL (например: `https://xyz789.ngrok-free.app`)

**Терминал 5 - Owner:**
```bash
cd owner
npm run dev
```

**Терминал 6 - ngrok для owner:**
```bash
ngrok http 5180
```

**Терминал 7 - Cashier:**
```bash
cd cashier
npm run dev
```

**Терминал 8 - ngrok для cashier:**
```bash
ngrok http 5174
```

### Шаг 5: Обновите .env

В `backend/.env`:
```env
CLIENT_APP_URL=https://xyz789.ngrok-free.app
OWNER_APP_URL=https://owner-url.ngrok-free.app
CASHIER_APP_URL=https://cashier-url.ngrok-free.app
```

### Шаг 6: Настройте Mini Apps

```bash
cd backend
npm run setup-mini-apps
```

### Шаг 7: Обновите API URL в frontend

В `shared/config.js` временно:
```javascript
baseURL: 'https://abc123.ngrok-free.app/api'
```

Или через переменные окружения в каждом frontend:
```env
VITE_API_URL=https://abc123.ngrok-free.app/api
```

## ⚠️ Важно

- URL меняется при каждом перезапуске ngrok
- Бесплатный план ngrok имеет ограничения
- Это только для тестирования!

## 🚀 Для постоянного деплоя

Используйте Vercel + Railway (см. `DEPLOY_VERCEL.md`)

---

## Альтернатива: ngrok с фиксированным доменом

Если у вас есть платный план ngrok:

```bash
ngrok http 3004 --domain=your-fixed-domain.ngrok.io
```

Тогда URL не будет меняться!
