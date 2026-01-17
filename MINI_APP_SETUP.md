# Настройка Telegram Mini Apps

## Пошаговая инструкция

### 1. Клиентский бот (app)

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Найдите или создайте бота с токеном: `8272586825:AAHMXoiBZtd0ZpUcjHStJrmFaz7iifKnM-0`
3. Отправьте команду `/newapp` или выберите бота и нажмите "Mini App"
4. Укажите:
   - **App title**: `Loyverse - Клиент`
   - **Short name**: `loyverse-client`
   - **Description**: `Система лояльности для клиентов`
   - **Photo**: Загрузите логотип (опционально)
   - **Web App URL**: 
     - Для разработки: `http://localhost:5173` или `https://your-dev-domain.com/app`
     - Для продакшена: `https://yourdomain.com/app`
   - **GIF**: Опционально
   - **Short name**: `loyverse-client`

### 2. Бот владельца (owner)

1. Найдите бота с токеном: `7711841902:AAE0A7ICbxJgHxk1mWGF1VWxGU2MBRnzeyk`
2. Отправьте `/newapp`
3. Укажите:
   - **App title**: `Loyverse - Владелец`
   - **Short name**: `loyverse-owner`
   - **Description**: `Панель управления заведениями`
   - **Web App URL**: 
     - Для разработки: `http://localhost:5180` или `https://your-dev-domain.com/owner`
     - Для продакшена: `https://yourdomain.com/owner`

### 3. Бот кассира (cashier)

1. Найдите бота с токеном: `8465358531:AAH6O6ov5QeJ-CZIXVywQIS6cR5f0iDMzp0`
2. Отправьте `/newapp`
3. Укажите:
   - **App title**: `Loyverse - Кассир`
   - **Short name**: `loyverse-cashier`
   - **Description**: `Приложение для кассиров`
   - **Web App URL**: 
     - Для разработки: `http://localhost:5174` или `https://your-dev-domain.com/cashier`
     - Для продакшена: `https://yourdomain.com/cashier`

## Альтернативный способ (через команду)

Если `/newapp` не работает, используйте:

```
/setmenubutton
```

Затем выберите бота и укажите:
- **Button text**: `Открыть приложение`
- **URL**: `https://yourdomain.com/app` (или `/owner`, `/cashier`)

## Важно для разработки

### Локальная разработка

Для локальной разработки нужно использовать **ngrok** или аналогичный туннель:

1. Установите ngrok: https://ngrok.com/
2. Запустите туннель:
   ```bash
   ngrok http 5173  # для app
   ngrok http 5180  # для owner
   ngrok http 5174  # для cashier
   ```
3. Используйте HTTPS URL от ngrok в BotFather

### Проверка настройки

После настройки Mini App:
1. Откройте бота в Telegram
2. В меню бота должна появиться кнопка "Открыть приложение"
3. При нажатии откроется ваше веб-приложение

## Требования к URL

- ✅ Должен быть HTTPS (кроме localhost для разработки)
- ✅ Должен быть доступен публично (или через туннель)
- ✅ Должен возвращать валидный HTML
- ✅ Должен поддерживать Telegram WebApp API
