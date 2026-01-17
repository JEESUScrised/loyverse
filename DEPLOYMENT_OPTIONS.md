# Варианты развертывания

## ❓ Обязательно ли всё запускать на одном сервере?

**НЕТ, не обязательно!** Можно развернуть компоненты на разных серверах.

## Варианты архитектуры

### Вариант 1: Всё на одном сервере (проще)

```
┌─────────────────────────────────┐
│   Один сервер (example.com)     │
├─────────────────────────────────┤
│  Backend API (порт 3004)        │
│  ├─ /api/*                      │
│                                  │
│  Frontend Apps (Nginx)          │
│  ├─ /app      → app/            │
│  ├─ /owner    → owner/          │
│  └─ /cashier  → cashier/        │
└─────────────────────────────────┘
```

**Плюсы:**
- ✅ Проще настроить
- ✅ Один домен для всех приложений
- ✅ Проще CORS настройка
- ✅ Меньше затрат

**Минусы:**
- ❌ Все компоненты зависят друг от друга
- ❌ Сложнее масштабировать

### Вариант 2: Раздельное развертывание (гибче)

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Backend API    │  │  Client App      │  │  Owner App      │
│  api.example.com│  │  app.example.com │  │  owner.example.com│
│  :3004          │  │  :5173           │  │  :5180          │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         └────────────────────┴────────────────────┘
                    API запросы
```

**Плюсы:**
- ✅ Независимое масштабирование
- ✅ Можно обновлять компоненты отдельно
- ✅ Разные домены/серверы для разных приложений
- ✅ Лучше для больших нагрузок

**Минусы:**
- ❌ Сложнее настройка CORS
- ❌ Нужно настраивать несколько доменов
- ❌ Больше затрат на инфраструктуру

## Настройка CORS для раздельного развертывания

Если frontend и backend на разных доменах, нужно настроить CORS:

### В backend/server.js:

```javascript
const allowedOrigins = [
  'https://app.example.com',
  'https://owner.example.com',
  'https://cashier.example.com',
  'http://localhost:5173',  // для разработки
  'http://localhost:5180',
  'http://localhost:5174'
]

app.use(cors({
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (например, Postman)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
```

### В shared/config.js:

```javascript
export const API_CONFIG = {
  // Для разных серверов укажите полный URL
  baseURL: import.meta.env?.VITE_API_URL || 'https://api.example.com/api',
  timeout: 10000
}
```

### Переменные окружения для каждого frontend:

**app/.env:**
```env
VITE_API_URL=https://api.example.com/api
```

**owner/.env:**
```env
VITE_API_URL=https://api.example.com/api
```

**cashier/.env:**
```env
VITE_API_URL=https://api.example.com/api
```

## Рекомендуемая архитектура

### Для старта (MVP):
- ✅ Всё на одном сервере
- ✅ Один домен с подпапками
- ✅ Проще и быстрее запустить

### Для продакшена (масштабирование):
- ✅ Backend на отдельном сервере/поддомене
- ✅ Frontend приложения можно на CDN (Vercel, Netlify)
- ✅ База данных на отдельном сервере (опционально)

## Пример конфигурации Nginx для одного сервера

```nginx
server {
    listen 80;
    server_name example.com;

    # Backend API
    location /api {
        proxy_pass http://localhost:3004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Client App
    location /app {
        alias /var/www/loyverse/app/dist;
        try_files $uri $uri/ /app/index.html;
    }

    # Owner App
    location /owner {
        alias /var/www/loyverse/owner/dist;
        try_files $uri $uri/ /owner/index.html;
    }

    # Cashier App
    location /cashier {
        alias /var/www/loyverse/cashier/dist;
        try_files $uri $uri/ /cashier/index.html;
    }
}
```

## Важно для Mini Apps

При настройке Mini Apps в BotFather:

- **Если всё на одном домене:**
  - Client: `https://example.com/app`
  - Owner: `https://example.com/owner`
  - Cashier: `https://example.com/cashier`

- **Если на разных доменах:**
  - Client: `https://app.example.com`
  - Owner: `https://owner.example.com`
  - Cashier: `https://cashier.example.com`
  - Backend: `https://api.example.com` (не нужен в Mini App, только для API)

## Вывод

Для начала используйте **один сервер** — это проще. Когда понадобится масштабирование, можно разделить на разные серверы. Backend API должен быть доступен по HTTPS для всех frontend приложений.
