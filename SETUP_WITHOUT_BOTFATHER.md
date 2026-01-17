# Настройка Mini Apps без доступа к BotFather

Если у вас есть только токены ботов, но нет доступа к аккаунту, который их создал, используйте этот метод.

## Шаг 1: Обновите .env файл

Добавьте URL ваших приложений в `backend/.env`:

```env
# Telegram Bot Tokens (уже должны быть)
TELEGRAM_CLIENT_BOT_TOKEN=8272586825:AAHMXoiBZtd0ZpUcjHStJrmFaz7iifKnM-0
TELEGRAM_OWNER_BOT_TOKEN=7711841902:AAE0A7ICbxJgHxk1mWGF1VWxGU2MBRnzeyk
TELEGRAM_CASHIER_BOT_TOKEN=8465358531:AAH6O6ov5QeJ-CZIXVywQIS6cR5f0iDMzp0

# URL ваших приложений (измените на свои)
CLIENT_APP_URL=https://yourdomain.com/app
OWNER_APP_URL=https://yourdomain.com/owner
CASHIER_APP_URL=https://yourdomain.com/cashier

# Для локальной разработки используйте ngrok:
# CLIENT_APP_URL=https://abc123.ngrok.io/app
# OWNER_APP_URL=https://abc123.ngrok.io/owner
# CASHIER_APP_URL=https://abc123.ngrok.io/cashier
```

## Шаг 2: Запустите скрипт настройки

```bash
cd backend
npm run setup-mini-apps
```

Скрипт автоматически настроит кнопку меню для всех трех ботов через Bot API.

## Альтернативный способ: Ручная настройка через API

Если скрипт не работает, можно настроить вручную через curl или Postman:

### Клиентский бот:
```bash
curl -X POST "https://api.telegram.org/bot8272586825:AAHMXoiBZtd0ZpUcjHStJrmFaz7iifKnM-0/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Открыть приложение",
      "web_app": {
        "url": "https://yourdomain.com/app"
      }
    }
  }'
```

### Бот владельца:
```bash
curl -X POST "https://api.telegram.org/bot7711841902:AAE0A7ICbxJgHxk1mWGF1VWxGU2MBRnzeyk/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Открыть приложение",
      "web_app": {
        "url": "https://yourdomain.com/owner"
      }
    }
  }'
```

### Бот кассира:
```bash
curl -X POST "https://api.telegram.org/bot8465358531:AAH6O6ov5QeJ-CZIXVywQIS6cR5f0iDMzp0/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Открыть приложение",
      "web_app": {
        "url": "https://yourdomain.com/cashier"
      }
    }
  }'
```

## Проверка настройки

После настройки:

1. Откройте бота в Telegram
2. В меню бота (кнопка с тремя линиями) должна появиться кнопка "Открыть приложение"
3. При нажатии откроется ваше веб-приложение

## Для локальной разработки

### Использование ngrok:

1. Установите ngrok: https://ngrok.com/download

2. Запустите туннель для вашего frontend:
   ```bash
   # Если app на порту 5173
   ngrok http 5173
   ```

3. Скопируйте HTTPS URL (например: `https://abc123.ngrok.io`)

4. Обновите .env:
   ```env
   CLIENT_APP_URL=https://abc123.ngrok.io/app
   ```

5. Запустите скрипт настройки:
   ```bash
   npm run setup-mini-apps
   ```

**Важно:** При каждом перезапуске ngrok URL меняется, нужно перенастраивать!

## Альтернатива: Deep Links

Если Mini App не работает, можно использовать deep links:

### Создайте команды для ботов:

```bash
# Клиентский бот
curl -X POST "https://api.telegram.org/bot8272586825:AAHMXoiBZtd0ZpUcjHStJrmFaz7iifKnM-0/setMyCommands" \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {"command": "start", "description": "Открыть приложение"}
    ]
  }'
```

Затем в обработчике команды `/start` отправляйте кнопку с Web App:

```javascript
// Пример для Node.js (если создадите бота-обработчика)
bot.onCommand('start', (msg) => {
  bot.sendMessage(msg.chat.id, 'Откройте приложение:', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: 'Открыть приложение',
          web_app: { url: 'https://yourdomain.com/app' }
        }
      ]]
    }
  })
})
```

## Важные замечания

1. **HTTPS обязателен** (кроме localhost для разработки)
2. **URL должен быть публично доступен**
3. **Токены должны быть валидными** - проверьте через:
   ```bash
   curl "https://api.telegram.org/botYOUR_TOKEN/getMe"
   ```
4. **Если бот был создан другим аккаунтом**, вы не сможете изменить его имя/описание, но можете настроить Mini App

## Проверка токенов

Проверьте, что токены работают:

```bash
# Клиентский
curl "https://api.telegram.org/bot8272586825:AAHMXoiBZtd0ZpUcjHStJrmFaz7iifKnM-0/getMe"

# Владелец
curl "https://api.telegram.org/bot7711841902:AAE0A7ICbxJgHxk1mWGF1VWxGU2MBRnzeyk/getMe"

# Кассир
curl "https://api.telegram.org/bot8465358531:AAH6O6ov5QeJ-CZIXVywQIS6cR5f0iDMzp0/getMe"
```

Если получаете `{"ok":true,"result":{...}}` - токены валидны!
