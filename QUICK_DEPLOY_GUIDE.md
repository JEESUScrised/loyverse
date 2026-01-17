# ⚡ Быстрый деплой - пошаговая инструкция

## 🎯 Цель: Задеплоить все приложения за 15 минут

---

## Шаг 1: Подготовка GitHub (2 минуты)

Если репозитория еще нет:

```powershell
# В папке проекта
git init
git add .
git commit -m "Initial commit"

# Создайте репозиторий на GitHub.com, затем:
git remote add origin https://github.com/yourusername/loyverse.git
git push -u origin main
```

---

## Шаг 2: Frontend на Vercel (5 минут)

### Способ A: Через веб-интерфейс (проще!)

1. Откройте https://vercel.com
2. Войдите через GitHub
3. **Add New Project**
4. Выберите репозиторий `loyverse`

**Деплой App:**
- **Project Name:** `loyverse-app`
- **Root Directory:** `app`
- **Framework:** Vite
- Нажмите **Deploy**

**Деплой Owner:**
- Повторите, но выберите **Root Directory:** `owner`
- **Project Name:** `loyverse-owner`

**Деплой Cashier:**
- Повторите, но выберите **Root Directory:** `cashier`
- **Project Name:** `loyverse-cashier`

### Способ B: Через CLI

```powershell
npm install -g vercel
vercel login

cd app
vercel --yes

cd ../owner
vercel --yes

cd ../cashier
vercel --yes
```

**Скопируйте URL каждого проекта!**

---

## Шаг 3: Backend на Railway (5 минут)

1. Откройте https://railway.app
2. Войдите через GitHub
3. **New Project → Deploy from GitHub repo**
4. Выберите репозиторий `loyverse`

### Настройка:

**Settings → General:**
- **Root Directory:** `backend`
- **Start Command:** `npm start`

**Settings → Variables → Add:**
```
TELEGRAM_CLIENT_BOT_TOKEN=8272586825:AAHMXoiBZtd0ZpUcjHStJrmFaz7iifKnM-0
TELEGRAM_OWNER_BOT_TOKEN=7711841902:AAE0A7ICbxJgHxk1mWGF1VWxGU2MBRnzeyk
TELEGRAM_CASHIER_BOT_TOKEN=8465358531:AAH6O6ov5QeJ-CZIXVywQIS6cR5f0iDMzp0
PORT=3004
```

**Settings → Networking:**
- **Generate Domain**
- Скопируйте URL (например: `loyverse-backend.up.railway.app`)

---

## Шаг 4: Связывание Frontend и Backend (3 минуты)

### В каждом проекте Vercel (app, owner, cashier):

1. Откройте проект в Vercel Dashboard
2. **Settings → Environment Variables**
3. **Add:**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://loyverse-backend.up.railway.app/api`
   - Отметьте все окружения (Production, Preview, Development)
4. **Save**
5. **Deployments → ... → Redeploy**

---

## Шаг 5: Настройка Mini Apps (2 минуты)

### В Railway добавьте переменные:

**Settings → Variables → Add:**
```
CLIENT_APP_URL=https://loyverse-app.vercel.app
OWNER_APP_URL=https://loyverse-owner.vercel.app
CASHIER_APP_URL=https://loyverse-cashier.vercel.app
```

### Настройте через Railway CLI:

```powershell
npm install -g @railway/cli
railway login
railway link
railway run npm run setup-mini-apps
```

### Или вручную через curl:

```powershell
# Замените URL на ваши реальные!

# Клиентский бот
curl -X POST "https://api.telegram.org/bot8272586825:AAHMXoiBZtd0ZpUcjHStJrmFaz7iifKnM-0/setChatMenuButton" -H "Content-Type: application/json" -d '{\"menu_button\":{\"type\":\"web_app\",\"text\":\"Открыть\",\"web_app\":{\"url\":\"https://loyverse-app.vercel.app\"}}}'

# Бот владельца  
curl -X POST "https://api.telegram.org/bot7711841902:AAE0A7ICbxJgHxk1mWGF1VWxGU2MBRnzeyk/setChatMenuButton" -H "Content-Type: application/json" -d '{\"menu_button\":{\"type\":\"web_app\",\"text\":\"Открыть\",\"web_app\":{\"url\":\"https://loyverse-owner.vercel.app\"}}}'

# Бот кассира
curl -X POST "https://api.telegram.org/bot8465358531:AAH6O6ov5QeJ-CZIXVywQIS6cR5f0iDMzp0/setChatMenuButton" -H "Content-Type: application/json" -d '{\"menu_button\":{\"type\":\"web_app\",\"text\":\"Открыть\",\"web_app\":{\"url\":\"https://loyverse-cashier.vercel.app\"}}}'
```

---

## ✅ Готово!

Проверьте:
1. ✅ Frontend открывается в браузере
2. ✅ Backend API отвечает
3. ✅ Mini Apps открываются в Telegram

---

## 🔄 Обновление

После каждого `git push`:
- Vercel автоматически передеплоит frontend
- Railway автоматически передеплоит backend

---

## 💡 Альтернатива: Render вместо Railway

Если Railway не работает:

1. https://render.com
2. **New → Web Service**
3. Connect GitHub
4. **Root Directory:** `backend`
5. **Start Command:** `npm start`
6. Добавьте переменные окружения

Получите URL: `loyverse-backend.onrender.com`
