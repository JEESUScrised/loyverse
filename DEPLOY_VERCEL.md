# Быстрый деплой на Vercel (5 минут)

## Шаг 1: Установите Vercel CLI

```bash
npm install -g vercel
```

Или используйте веб-интерфейс: https://vercel.com

## Шаг 2: Деплой Frontend приложений

### App (клиентское)

```bash
cd app
vercel
```

Ответьте на вопросы:
- Set up and deploy? **Y**
- Which scope? **Ваш аккаунт**
- Link to existing project? **N**
- Project name? **loyverse-app**
- Directory? **./**
- Override settings? **N**

После деплоя получите URL: `https://loyverse-app.vercel.app`

### Owner

```bash
cd owner
vercel
# Project name: loyverse-owner
```

URL: `https://loyverse-owner.vercel.app`

### Cashier

```bash
cd cashier
vercel
# Project name: loyverse-cashier
```

URL: `https://loyverse-cashier.vercel.app`

## Шаг 3: Настройте переменные окружения

В каждом проекте на Vercel:
1. Settings → Environment Variables
2. Добавьте: `VITE_API_URL` = `https://your-backend-url.com/api`

## Шаг 4: Деплой Backend на Railway

1. Зайдите на https://railway.app
2. New Project → Deploy from GitHub
3. Выберите репозиторий
4. Settings → Add Service → выберите `backend` папку
5. Settings → Variables → добавьте все из `.env`
6. Settings → Networking → Generate Domain

Получите URL: `https://loyverse-backend.up.railway.app`

## Шаг 5: Обновите API URL

В Vercel для каждого frontend проекта:
- Settings → Environment Variables
- `VITE_API_URL` = `https://loyverse-backend.up.railway.app/api`

Передеплойте проекты (они обновятся автоматически).

## Шаг 6: Настройте Mini Apps

Обновите `backend/.env`:
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

## Готово! 🎉

Теперь у вас:
- ✅ 3 frontend приложения на Vercel с HTTPS
- ✅ Backend на Railway с HTTPS
- ✅ Mini Apps настроены в Telegram

## Обновление кода

После каждого `git push`:
- Vercel автоматически передеплоит frontend
- Railway автоматически передеплоит backend

## Кастомные домены (опционально)

В Vercel:
1. Project Settings → Domains
2. Add Domain
3. Настройте DNS записи

В Railway:
1. Settings → Networking
2. Custom Domain
3. Добавьте домен
