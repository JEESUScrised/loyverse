# 🚀 Деплой Loyverse - Простая инструкция

## ⚡ Быстрый старт (15 минут)

### 1. Frontend на Vercel (5 минут)

**Через веб-интерфейс:**

1. Откройте https://vercel.com
2. Войдите через GitHub
3. **Add New Project** → Выберите репозиторий

**Деплойте 3 раза с разными настройками:**

| Проект | Root Directory | Project Name |
|--------|---------------|--------------|
| App | `app` | `loyverse-app` |
| Owner | `owner` | `loyverse-owner` |
| Cashier | `cashier` | `loyverse-cashier` |

**Скопируйте URL каждого проекта!**

---

### 2. Backend на Railway (5 минут)

1. Откройте https://railway.app
2. Войдите через GitHub
3. **New Project → Deploy from GitHub repo**
4. Выберите репозиторий

**Настройки:**
- **Root Directory:** `backend`
- **Start Command:** `npm start`

**Variables (Settings → Variables):**
```
TELEGRAM_CLIENT_BOT_TOKEN=8272586825:AAHMXoiBZtd0ZpUcjHStJrmFaz7iifKnM-0
TELEGRAM_OWNER_BOT_TOKEN=7711841902:AAE0A7ICbxJgHxk1mWGF1VWxGU2MBRnzeyk
TELEGRAM_CASHIER_BOT_TOKEN=8465358531:AAH6O6ov5QeJ-CZIXVywQIS6cR5f0iDMzp0
PORT=3004
```

**Networking:**
- **Generate Domain** → Скопируйте URL

---

### 3. Связывание (3 минуты)

**В каждом проекте Vercel:**

**Settings → Environment Variables → Add:**
- **Key:** `VITE_API_URL`
- **Value:** `https://your-backend-url.up.railway.app/api`
- **Redeploy** проект

---

### 4. Mini Apps (2 минуты)

**В Railway добавьте:**
```
CLIENT_APP_URL=https://loyverse-app.vercel.app
OWNER_APP_URL=https://loyverse-owner.vercel.app
CASHIER_APP_URL=https://loyverse-cashier.vercel.app
```

**Настройте через Railway CLI:**

```powershell
npm install -g @railway/cli
railway login
railway link
railway run npm run setup-mini-apps
```

---

## ✅ Готово!

Теперь все работает:
- ✅ Frontend на Vercel (HTTPS автоматически)
- ✅ Backend на Railway (HTTPS автоматически)
- ✅ Mini Apps настроены
- ✅ Автоматический деплой при каждом push

---

## 📚 Подробные инструкции

- `DEPLOY_STEP_BY_STEP.md` - пошаговая инструкция
- `QUICK_DEPLOY_GUIDE.md` - быстрый гайд
- `DEPLOY_CHECKLIST.md` - чеклист для проверки

---

## 💡 Советы

- Все URL будут с HTTPS автоматически
- Бесплатные планы достаточны для тестирования
- При каждом `git push` происходит автоматический деплой
