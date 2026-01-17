# 🚀 Пошаговая инструкция деплоя

## Подготовка (2 минуты)

### 1. Убедитесь, что код в GitHub

```powershell
# Если еще не в git:
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/yourusername/loyverse.git
git push -u origin main
```

---

## Часть 1: Frontend на Vercel (10 минут)

### Шаг 1: Установите Vercel CLI

```powershell
npm install -g vercel
```

### Шаг 2: Войдите в Vercel

```powershell
vercel login
```

Следуйте инструкциям в браузере.

### Шаг 3: Деплой App (клиентское)

```powershell
cd app
vercel
```

**Ответьте:**
- Set up and deploy? → **Y**
- Which scope? → **Ваш аккаунт**
- Link to existing project? → **N**
- Project name? → **loyverse-app**
- Directory? → **./**
- Override settings? → **N**

**Скопируйте URL:** `https://loyverse-app.vercel.app` (или другой)

### Шаг 4: Деплой Owner

```powershell
cd ../owner
vercel
```

**Ответьте:**
- Link to existing project? → **N**
- Project name? → **loyverse-owner**

**Скопируйте URL:** `https://loyverse-owner.vercel.app`

### Шаг 5: Деплой Cashier

```powershell
cd ../cashier
vercel
```

**Ответьте:**
- Link to existing project? → **N**
- Project name? → **loyverse-cashier**

**Скопируйте URL:** `https://loyverse-cashier.vercel.app`

---

## Часть 2: Backend на Railway (5 минут)

### Шаг 1: Зарегистрируйтесь

1. Откройте https://railway.app
2. Нажмите **Login with GitHub**
3. Авторизуйтесь

### Шаг 2: Создайте проект

1. Нажмите **New Project**
2. Выберите **Deploy from GitHub repo**
3. Выберите репозиторий `loyverse`
4. Railway автоматически определит проект

### Шаг 3: Настройте сервис

1. Нажмите на созданный сервис
2. **Settings → General:**
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`

### Шаг 4: Добавьте переменные окружения

**Settings → Variables → New Variable:**

Добавьте по одной:

```
TELEGRAM_CLIENT_BOT_TOKEN = 8272586825:AAHMXoiBZtd0ZpUcjHStJrmFaz7iifKnM-0
TELEGRAM_OWNER_BOT_TOKEN = 7711841902:AAE0A7ICbxJgHxk1mWGF1VWxGU2MBRnzeyk
TELEGRAM_CASHIER_BOT_TOKEN = 8465358531:AAH6O6ov5QeJ-CZIXVywQIS6cR5f0iDMzp0
PORT = 3004
```

### Шаг 5: Получите URL

1. **Settings → Networking**
2. Нажмите **Generate Domain**
3. Скопируйте URL (например: `loyverse-backend.up.railway.app`)

---

## Часть 3: Настройка Frontend (3 минуты)

### Для каждого проекта (app, owner, cashier):

1. Откройте проект в Vercel Dashboard: https://vercel.com/dashboard
2. **Settings → Environment Variables**
3. **Add New:**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://loyverse-backend.up.railway.app/api`
   - **Environment:** Production, Preview, Development (все три)
4. **Save**
5. **Deployments → ... → Redeploy** (или подождите автоматического передеплоя)

---

## Часть 4: Настройка Mini Apps (2 минуты)

### Вариант 1: Через Railway Console (рекомендуется)

1. Откройте проект в Railway
2. **Deployments → Latest → View Logs**
3. Или используйте **Railway CLI:**

```powershell
# Установите Railway CLI
npm install -g @railway/cli

# Войдите
railway login

# Подключитесь к проекту
railway link

# Добавьте переменные окружения
railway variables set CLIENT_APP_URL=https://loyverse-app.vercel.app
railway variables set OWNER_APP_URL=https://loyverse-owner.vercel.app
railway variables set CASHIER_APP_URL=https://loyverse-cashier.vercel.app

# Выполните команду настройки
railway run npm run setup-mini-apps
```

### Вариант 2: Вручную через curl

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

## ✅ Проверка

После деплоя проверьте:

1. **Frontend:**
   - `https://loyverse-app.vercel.app` - открывается приложение
   - `https://loyverse-owner.vercel.app` - открывается приложение
   - `https://loyverse-cashier.vercel.app` - открывается приложение

2. **Backend:**
   - `https://loyverse-backend.up.railway.app/api/venues` - возвращает JSON

3. **Telegram:**
   - Откройте бота в Telegram
   - Нажмите кнопку меню
   - Приложение должно открыться

---

## 🔄 Обновление кода

После каждого `git push`:
- **Vercel** автоматически передеплоит frontend
- **Railway** автоматически передеплоит backend

---

## 🆘 Если что-то не работает

### Frontend не открывается:
- Проверьте, что `vercel.json` есть в каждой папке
- Проверьте логи деплоя в Vercel Dashboard

### Backend не работает:
- Проверьте логи в Railway
- Убедитесь, что все переменные окружения добавлены
- Проверьте, что порт указан правильно

### Mini Apps не открываются:
- Проверьте, что URL правильные (без `/app`, `/owner`, `/cashier` в конце)
- Убедитесь, что выполнили `setup-mini-apps`
- Попробуйте закрыть и открыть бота заново

---

## 💰 Стоимость

- **Vercel:** Бесплатно (до 100GB трафика/месяц)
- **Railway:** Бесплатно (до $5 кредитов/месяц)

Достаточно для тестирования и небольшого продакшена!
