# 🚀 Начните деплой прямо сейчас!

## Самый быстрый способ (15 минут)

### Вариант 1: Через Vercel Dashboard (без CLI) - Рекомендуется!

#### 1. Frontend на Vercel (5 минут)

1. Откройте https://vercel.com
2. Войдите через GitHub
3. Нажмите **Add New Project**
4. Импортируйте репозиторий (если нет на GitHub - создайте)

**Для App:**
- **Project Name:** `loyverse-app`
- **Root Directory:** `app`
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**Для Owner:**
- **Project Name:** `loyverse-owner`
- **Root Directory:** `owner`
- Остальное то же самое

**Для Cashier:**
- **Project Name:** `loyverse-cashier`
- **Root Directory:** `cashier`
- Остальное то же самое

#### 2. Backend на Railway (5 минут)

1. Откройте https://railway.app
2. Войдите через GitHub
3. **New Project → Deploy from GitHub repo**
4. Выберите репозиторий
5. **Settings → Root Directory:** `backend`
6. **Settings → Variables** - добавьте все токены
7. **Settings → Networking → Generate Domain**

#### 3. Настройка (5 минут)

1. Скопируйте URL backend (например: `loyverse-backend.up.railway.app`)
2. В каждом проекте Vercel: **Settings → Environment Variables**
   - Добавьте: `VITE_API_URL` = `https://loyverse-backend.up.railway.app/api`
3. Скопируйте URL frontend приложений
4. В Railway: **Settings → Variables**
   - Добавьте: `CLIENT_APP_URL` = `https://loyverse-app.vercel.app`
   - Добавьте: `OWNER_APP_URL` = `https://loyverse-owner.vercel.app`
   - Добавьте: `CASHIER_APP_URL` = `https://loyverse-cashier.vercel.app`
5. Настройте Mini Apps (см. ниже)

---

## Настройка Mini Apps

### Через Railway CLI:

```powershell
npm install -g @railway/cli
railway login
railway link
railway run npm run setup-mini-apps
```

### Или вручную через curl:

```powershell
# Клиентский бот
curl -X POST "https://api.telegram.org/bot8272586825:AAHMXoiBZtd0ZpUcjHStJrmFaz7iifKnM-0/setChatMenuButton" -H "Content-Type: application/json" -d '{\"menu_button\":{\"type\":\"web_app\",\"text\":\"Открыть\",\"web_app\":{\"url\":\"https://loyverse-app.vercel.app\"}}}'

# Бот владельца
curl -X POST "https://api.telegram.org/bot7711841902:AAE0A7ICbxJgHxk1mWGF1VWxGU2MBRnzeyk/setChatMenuButton" -H "Content-Type: application/json" -d '{\"menu_button\":{\"type\":\"web_app\",\"text\":\"Открыть\",\"web_app\":{\"url\":\"https://loyverse-owner.vercel.app\"}}}'

# Бот кассира
curl -X POST "https://api.telegram.org/bot8465358531:AAH6O6ov5QeJ-CZIXVywQIS6cR5f0iDMzp0/setChatMenuButton" -H "Content-Type: application/json" -d '{\"menu_button\":{\"type\":\"web_app\",\"text\":\"Открыть\",\"web_app\":{\"url\":\"https://loyverse-cashier.vercel.app\"}}}'
```

---

## ✅ Готово!

После деплоя:
- ✅ Все приложения доступны по HTTPS
- ✅ Автоматический деплой при каждом push
- ✅ Бесплатные планы достаточны для тестирования

---

## 📝 Что изменилось для деплоя

- ✅ `app/vite.config.js` - `base: '/'` (для Vercel)
- ✅ `owner/vite.config.js` - `base: '/'` (для Vercel)
- ✅ `cashier/vite.config.js` - `base: '/'` (для Vercel)
- ✅ `app/src/App.jsx` - `basename: '/'` (для Vercel)
- ✅ `vercel.json` файлы уже настроены

Всё готово для деплоя!
