# Быстрый деплой с HTTPS

## 🚀 Вариант 1: Vercel (Frontend) + Railway (Backend) - Рекомендуется

### Frontend на Vercel (5 минут)

1. **Установите Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Деплой каждого приложения:**

   **App (клиентское):**
   ```bash
   cd app
   vercel
   # Следуйте инструкциям, выберите:
   # - Set up and deploy? Yes
   # - Which scope? Ваш аккаунт
   # - Link to existing project? No
   # - Project name? loyverse-app
   # - Directory? ./
   # - Override settings? No
   ```

   **Owner:**
   ```bash
   cd owner
   vercel
   # Project name: loyverse-owner
   ```

   **Cashier:**
   ```bash
   cd cashier
   vercel
   # Project name: loyverse-cashier
   ```

3. **Настройте base path** (если нужно):

   Создайте `vercel.json` в каждой папке:
   
   **app/vercel.json:**
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### Backend на Railway (5 минут)

1. **Зарегистрируйтесь:** https://railway.app (через GitHub)

2. **Создайте новый проект:**
   - New Project → Deploy from GitHub repo
   - Или: New Project → Empty Project

3. **Добавьте сервис:**
   - New → GitHub Repo → выберите ваш репозиторий
   - Или: New → Empty Service

4. **Настройте деплой:**
   - Root Directory: `backend`
   - Start Command: `npm start`
   - Port: `3004`

5. **Добавьте переменные окружения:**
   - Settings → Variables
   - Добавьте все из `backend/.env`:
     ```
     TELEGRAM_CLIENT_BOT_TOKEN=...
     TELEGRAM_OWNER_BOT_TOKEN=...
     TELEGRAM_CASHIER_BOT_TOKEN=...
     PORT=3004
     ```

6. **Получите URL:**
   - Settings → Networking → Generate Domain
   - Скопируйте URL (например: `loyverse-backend.up.railway.app`)

7. **Обновите .env в frontend:**
   - В Vercel: Settings → Environment Variables
   - Добавьте: `VITE_API_URL=https://loyverse-backend.up.railway.app/api`

### Обновите .env для Mini Apps

В `backend/.env`:
```env
CLIENT_APP_URL=https://loyverse-app.vercel.app
OWNER_APP_URL=https://loyverse-owner.vercel.app
CASHIER_APP_URL=https://loyverse-cashier.vercel.app
```

Запустите:
```bash
cd backend
npm run setup-mini-apps
```

---

## 🚀 Вариант 2: Всё на Vercel (ещё быстрее!)

### Frontend на Vercel (как выше)

### Backend на Vercel Serverless Functions

1. **Создайте `vercel.json` в корне проекта:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "backend/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "backend/server.js"
       }
     ]
   }
   ```

2. **Обновите `backend/server.js` для Vercel:**
   ```javascript
   // В конце файла замените:
   // app.listen(PORT, ...)
   // на:
   
   export default app
   ```

3. **Деплой:**
   ```bash
   vercel
   ```

**Минус:** SQLite не работает на serverless, нужна внешняя БД (например, Railway PostgreSQL)

---

## 🚀 Вариант 3: Render (альтернатива Railway)

### Backend на Render:

1. **Зарегистрируйтесь:** https://render.com

2. **New → Web Service:**
   - Connect GitHub repo
   - Name: `loyverse-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Environment Variables:**
   - Добавьте все из `.env`

4. **Получите URL:**
   - После деплоя получите: `loyverse-backend.onrender.com`

---

## 🚀 Вариант 4: ngrok (для тестирования, 2 минуты)

Только для быстрого тестирования!

1. **Установите ngrok:**
   ```bash
   # Windows: скачайте с https://ngrok.com/download
   # Или через chocolatey:
   choco install ngrok
   ```

2. **Запустите туннель:**
   ```bash
   # Для frontend (если на порту 5173)
   ngrok http 5173
   
   # Для backend (в другом терминале)
   ngrok http 3004
   ```

3. **Скопируйте HTTPS URL** (например: `https://abc123.ngrok.io`)

4. **Обновите .env:**
   ```env
   CLIENT_APP_URL=https://abc123.ngrok.io
   # и т.д.
   ```

5. **Настройте Mini Apps:**
   ```bash
   npm run setup-mini-apps
   ```

**⚠️ Внимание:** URL меняется при каждом перезапуске ngrok!

---

## 📋 Чеклист быстрого деплоя

- [ ] Frontend на Vercel (app, owner, cashier)
- [ ] Backend на Railway/Render
- [ ] Обновлены переменные окружения
- [ ] Обновлен `VITE_API_URL` в frontend
- [ ] Обновлены URL в `backend/.env`
- [ ] Запущен `npm run setup-mini-apps`
- [ ] Проверены Mini Apps в Telegram

---

## 🎯 Рекомендация

**Для быстрого старта:**
1. Frontend → Vercel (бесплатно, автоматический HTTPS)
2. Backend → Railway (бесплатный план, автоматический HTTPS)
3. Время: ~15 минут

**Для продакшена:**
- Используйте свой домен
- Настройте кастомные домены в Vercel/Railway
- Добавьте SSL сертификаты (автоматически)

---

## 🔧 Настройка кастомных доменов (опционально)

### Vercel:
1. Project Settings → Domains
2. Добавьте свой домен
3. Настройте DNS записи

### Railway:
1. Settings → Networking
2. Custom Domain
3. Добавьте домен и настройте DNS

---

## ⚡ Самый быстрый способ (ngrok для теста)

Если нужно протестировать прямо сейчас:

```bash
# Терминал 1: Backend
cd backend
npm start

# Терминал 2: ngrok для backend
ngrok http 3004
# Скопируйте URL: https://abc123.ngrok.io

# Терминал 3: Frontend (app)
cd app
npm run dev

# Терминал 4: ngrok для frontend
ngrok http 5173
# Скопируйте URL: https://xyz789.ngrok.io

# Обновите .env и настройте Mini Apps
```

**Время: 5 минут!** Но URL меняется при перезапуске.
