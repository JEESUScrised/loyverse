# 🚀 Быстрый деплой (15 минут)

## Шаг 1: Подготовка GitHub репозитория

Если у вас еще нет репозитория на GitHub:

```powershell
# Инициализируйте git (если еще не сделано)
git init
git add .
git commit -m "Initial commit"

# Создайте репозиторий на GitHub и выполните:
git remote add origin https://github.com/yourusername/loyverse.git
git push -u origin main
```

---

## Шаг 2: Деплой Frontend на Vercel (5 минут)

### 2.1. Установите Vercel CLI

```powershell
npm install -g vercel
```

### 2.2. Войдите в Vercel

```powershell
vercel login
```

### 2.3. Деплой App (клиентское приложение)

```powershell
cd app
vercel
```

**Ответьте на вопросы:**
- Set up and deploy? **Yes**
- Which scope? **Ваш аккаунт**
- Link to existing project? **No**
- Project name? **loyverse-app**
- Directory? **./**
- Override settings? **No**

**Скопируйте URL** (например: `https://loyverse-app.vercel.app`)

### 2.4. Деплой Owner

```powershell
cd ../owner
vercel
# Project name: loyverse-owner
```

**Скопируйте URL** (например: `https://loyverse-owner.vercel.app`)

### 2.5. Деплой Cashier

```powershell
cd ../cashier
vercel
# Project name: loyverse-cashier
```

**Скопируйте URL** (например: `https://loyverse-cashier.vercel.app`)

---

## Шаг 3: Деплой Backend на Railway (5 минут)

### 3.1. Зарегистрируйтесь на Railway

1. Откройте https://railway.app
2. Войдите через GitHub

### 3.2. Создайте новый проект

1. Нажмите **New Project**
2. Выберите **Deploy from GitHub repo**
3. Выберите ваш репозиторий `loyverse`

### 3.3. Настройте сервис

1. Railway автоматически определит проект
2. Нажмите на сервис → **Settings**
3. Установите:
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`
   - **Port:** `3004` (или оставьте автоматический)

### 3.4. Добавьте переменные окружения

В **Settings → Variables** добавьте:

```env
TELEGRAM_CLIENT_BOT_TOKEN=8272586825:AAHMXoiBZtd0ZpUcjHStJrmFaz7iifKnM-0
TELEGRAM_OWNER_BOT_TOKEN=7711841902:AAE0A7ICbxJgHxk1mWGF1VWxGU2MBRnzeyk
TELEGRAM_CASHIER_BOT_TOKEN=8465358531:AAH6O6ov5QeJ-CZIXVywQIS6cR5f0iDMzp0
PORT=3004
```

### 3.5. Получите URL

1. **Settings → Networking → Generate Domain**
2. Скопируйте URL (например: `loyverse-backend.up.railway.app`)

---

## Шаг 4: Настройка Frontend (3 минуты)

### 4.1. Обновите переменные окружения в Vercel

Для каждого проекта (app, owner, cashier):

1. Откройте проект в Vercel Dashboard
2. **Settings → Environment Variables**
3. Добавьте:
   ```
   VITE_API_URL=https://loyverse-backend.up.railway.app/api
   ```
4. **Redeploy** проект

### 4.2. Обновите `shared/config.js` (опционально)

Если хотите, чтобы работало и локально:

```javascript
baseURL: import.meta.env?.VITE_API_URL || 'https://loyverse-backend.up.railway.app/api'
```

---

## Шаг 5: Настройка Mini Apps (2 минуты)

### 5.1. Обновите переменные окружения в Railway

В **Settings → Variables** добавьте:

```env
CLIENT_APP_URL=https://loyverse-app.vercel.app
OWNER_APP_URL=https://loyverse-owner.vercel.app
CASHIER_APP_URL=https://loyverse-cashier.vercel.app
```

### 5.2. Запустите скрипт настройки

**Вариант 1: Локально (если есть доступ к проекту)**

```powershell
cd backend
# Обновите .env с новыми URL
npm run setup-mini-apps
```

**Вариант 2: Через Railway Console**

1. Откройте проект в Railway
2. **Deployments → Latest → View Logs**
3. Или используйте **Railway CLI** для выполнения команды

**Вариант 3: Вручную через curl**

```powershell
# Клиентский бот
curl -X POST "https://api.telegram.org/bot8272586825:AAHMXoiBZtd0ZpUcjHStJrmFaz7iifKnM-0/setChatMenuButton" `
  -H "Content-Type: application/json" `
  -d '{\"menu_button\":{\"type\":\"web_app\",\"text\":\"Открыть приложение\",\"web_app\":{\"url\":\"https://loyverse-app.vercel.app\"}}}'

# Бот владельца
curl -X POST "https://api.telegram.org/bot7711841902:AAE0A7ICbxJgHxk1mWGF1VWxGU2MBRnzeyk/setChatMenuButton" `
  -H "Content-Type: application/json" `
  -d '{\"menu_button\":{\"type\":\"web_app\",\"text\":\"Открыть приложение\",\"web_app\":{\"url\":\"https://loyverse-owner.vercel.app\"}}}'

# Бот кассира
curl -X POST "https://api.telegram.org/bot8465358531:AAH6O6ov5QeJ-CZIXVywQIS6cR5f0iDMzp0/setChatMenuButton" `
  -H "Content-Type: application/json" `
  -d '{\"menu_button\":{\"type\":\"web_app\",\"text\":\"Открыть приложение\",\"web_app\":{\"url\":\"https://loyverse-cashier.vercel.app\"}}}'
```

---

## ✅ Готово!

После деплоя:

1. ✅ Frontend доступен на Vercel (HTTPS автоматически)
2. ✅ Backend доступен на Railway (HTTPS автоматически)
3. ✅ Mini Apps настроены в Telegram
4. ✅ Все работает без локального запуска!

---

## 🔧 Альтернатива: Render вместо Railway

Если Railway не работает, используйте Render:

1. Зарегистрируйтесь: https://render.com
2. **New → Web Service**
3. Connect GitHub repo
4. Настройки:
   - **Name:** `loyverse-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Добавьте переменные окружения (как в Railway)
6. Получите URL: `loyverse-backend.onrender.com`

---

## 📋 Чеклист

- [ ] Репозиторий на GitHub
- [ ] Vercel CLI установлен
- [ ] App задеплоен на Vercel
- [ ] Owner задеплоен на Vercel
- [ ] Cashier задеплоен на Vercel
- [ ] Backend задеплоен на Railway/Render
- [ ] Переменные окружения добавлены в Railway
- [ ] `VITE_API_URL` добавлен в Vercel для всех frontend
- [ ] Mini Apps настроены в Telegram
- [ ] Проверено в Telegram - приложения открываются

---

## 💡 Советы

- **Vercel** автоматически передеплоит при push в GitHub
- **Railway** тоже поддерживает автоматический деплой из GitHub
- Все URL будут с HTTPS автоматически
- Бесплатные планы достаточны для тестирования
