# Настройка Telegram ботов

Проект использует 3 отдельных Telegram бота для разных приложений:

1. **Клиентский бот** (`client`) - для клиентского приложения (app)
2. **Бот владельца** (`owner`) - для приложения владельца заведения
3. **Бот кассира** (`cashier`) - для приложения кассира

## Переменные окружения

Для работы с Telegram ботами необходимо установить следующие переменные окружения в файле `.env` в директории `backend/`:

```env
# Telegram Bot Tokens
TELEGRAM_CLIENT_BOT_TOKEN=your_client_bot_token_here
TELEGRAM_OWNER_BOT_TOKEN=your_owner_bot_token_here
TELEGRAM_CASHIER_BOT_TOKEN=your_cashier_bot_token_here

# Для обратной совместимости (если не указаны отдельные токены)
TELEGRAM_BOT_TOKEN=your_client_bot_token_here
```

## Создание ботов в Telegram

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Создайте 3 бота командой `/newbot`:
   - Клиентский бот (например: `LoyverseClientBot`)
   - Бот владельца (например: `LoyverseOwnerBot`)
   - Бот кассира (например: `LoyverseCashierBot`)
3. Для каждого бота получите токен и сохраните его в переменные окружения

## Настройка Mini Apps

Для каждого бота необходимо настроить Mini App:

1. В [@BotFather](https://t.me/botfather) выберите бота
2. Используйте команду `/newapp` или `/setmenubutton`
3. Укажите URL вашего приложения:
   - Клиентский бот: `https://yourdomain.com/app`
   - Бот владельца: `https://yourdomain.com/owner`
   - Бот кассира: `https://yourdomain.com/cashier`

## Эндпоинты аутентификации

### Клиентское приложение
```
POST /api/clients/auth
Body: { "initData": "telegram_init_data_string" }
```

### Приложение владельца
```
POST /api/owners/auth
Body: { "initData": "telegram_init_data_string" }
```

### Приложение кассира
```
POST /api/cashiers/auth
Body: { "initData": "telegram_init_data_string" }
```

## Валидация initData

Backend автоматически валидирует `initData` от каждого бота используя соответствующий токен. Валидация проверяет:
- Подлинность данных от Telegram
- Целостность данных (hash проверка)
- Соответствие токену конкретного бота

## Безопасность

⚠️ **Важно**: В production обязательно установите все три токена. Без токенов валидация будет пропущена (только для разработки).

Для включения строгой валидации в production убедитесь, что все токены установлены и не начинаются с `YOUR_`.

## Структура базы данных

### Таблица `users`
- `telegramId` - привязка к клиентскому боту

### Таблица `owners`
- `telegramId` - привязка к боту владельца
- `subscriptionStatus` - статус подписки (active/inactive)
- `subscriptionEndDate` - дата окончания подписки

### Таблица `cashiers`
- `telegramId` - привязка к боту кассира (опционально, для Telegram авторизации)
- `id` - ID кассира (для обычной авторизации)
- `password` - пароль (для обычной авторизации)

## Привязка кассира к Telegram

При создании кассира можно указать `telegramId`:

```javascript
POST /api/cashiers
Body: {
  "id": "cashier_001",
  "password": "password123",
  "telegramId": "123456789", // Опционально
  "venueId": 1,
  "venueName": "Кафе"
}
```

Если `telegramId` указан, кассир может авторизоваться через Telegram бота без ввода ID и пароля.

