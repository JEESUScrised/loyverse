# Loyverse Backend

Backend API сервер для системы лояльности Loyverse.

## Установка

```bash
cd backend
npm install
```

## Запуск

### Разработка
```bash
npm run dev
```

### Продакшн
```bash
npm start
```

Сервер запустится на `http://localhost:3003`

## API Endpoints

### Venues (Заведения)
- `GET /api/venues` - Список всех заведений
- `GET /api/venues/:id` - Получить заведение по ID
- `POST /api/venues` - Создать заведение
- `PUT /api/venues/:id` - Обновить заведение
- `DELETE /api/venues/:id` - Удалить заведение
- `GET /api/venues/:id/stats` - Статистика заведения
- `GET /api/venues/:id/subscription` - Информация о подписке
- `PUT /api/venues/:id/subscription` - Обновить подписку

### Cashiers (Кассиры)
- `GET /api/venues/:venueId/cashiers` - Список кассиров заведения
- `POST /api/cashiers` - Создать кассира
- `POST /api/cashiers/login` - Авторизация кассира
- `DELETE /api/cashiers/:id` - Удалить кассира

### Users (Пользователи)
- `GET /api/users/:id` - Получить/создать пользователя
- `PUT /api/users/:id/points` - Обновить баллы пользователя
- `GET /api/users/:id/venue-points` - Личные баллы по заведениям
- `PUT /api/users/:id/venue-points` - Обновить личные баллы

### Transactions (Транзакции)
- `POST /api/transactions/earn` - Начислить баллы
- `POST /api/transactions/spend` - Списать баллы (покупка)

### Activities (Активности)
- `GET /api/activities` - Список активностей (с фильтрами)
- `POST /api/activities` - Добавить активность

### Owner Venues
- `GET /api/owners/:ownerId/venues` - Заведения владельца
- `POST /api/owners/:ownerId/venues/:venueId` - Привязать заведение к владельцу

### Health Check
- `GET /api/health` - Проверка работоспособности

## База данных

Используется SQLite (файл `loyverse.db`). База создается автоматически при первом запуске.

## Переменные окружения

- `PORT` - Порт сервера (по умолчанию 3003)
