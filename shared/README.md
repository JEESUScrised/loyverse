# Loyverse Shared Database

Централизованная база данных для всех приложений Loyverse.

## Установка

База данных уже настроена через Vite alias `@shared`. Просто импортируйте:

```javascript
import database from '@shared/database.js'
```

## Настройка API

База данных использует API для хранения данных. Настройте URL API через переменную окружения:

1. Создайте файл `.env` в корне каждого приложения (app, owner, cashier)
2. Добавьте переменную:
   ```
   VITE_API_URL=http://localhost:3003/api
   ```

Или измените значение по умолчанию в `shared/config.js`.

Если API недоступен, база данных автоматически использует localStorage как fallback.

## Использование

### Заведения (Venues)

```javascript
// Получить все заведения
const venues = database.getVenues()

// Добавить заведение
const newVenue = database.addVenue({
  name: 'Кафе "Уютное"',
  address: 'ул. Примерная, 10',
  pointsPerVisit: 10,
  pointsType: 'common',
  menu: [...]
})

// Обновить заведение
database.updateVenue(venueId, { name: 'Новое название' })

// Удалить заведение
database.deleteVenue(venueId)

// Найти заведение по ID
const venue = database.getVenueById(venueId)

// Найти заведения по условию
const commonVenues = database.findVenues(v => v.pointsType === 'common')
```

### Кассиры (Cashiers)

```javascript
// Получить всех кассиров
const cashiers = database.getCashiers()

// Добавить кассира
const cashier = database.addCashier({
  id: 'cashier1',
  password: 'password123',
  venueId: 1,
  venueName: 'Кафе "Уютное"'
})

// Обновить кассира
database.updateCashier(cashierId, { password: 'newpassword' })

// Удалить кассира
database.deleteCashier(cashierId)
```

### Активность (Activities)

```javascript
// Получить всю активность
const activities = database.getActivities()

// Добавить активность
database.addActivity({
  type: 'points_earned',
  userId: 'user123',
  venueId: 1,
  points: 50,
  date: new Date().toISOString()
})

// Найти активность по условию
const venueActivities = database.findActivities(a => a.venueId === 1)
```

### Пользовательские данные

```javascript
// Баллы пользователя
const points = database.getUserPoints(userId)
database.setUserPoints(userId, 3000)

// Личные баллы по заведениям
const venuePoints = database.getUserVenuePoints(userId)
database.setUserVenuePoints(userId, { 1: 100, 2: 50 })

// Активность пользователя
const activities = database.getUserActivities(userId)
database.setUserActivities(userId, [...])
```

### Подписки

```javascript
// Получить подписку
const subscription = database.getSubscription(venueId)

// Установить подписку
database.setSubscription(venueId, endDate)
```

### Подписка на изменения

```javascript
// Подписаться на изменения базы данных
const unsubscribe = database.subscribe((event, data) => {
  console.log('База данных изменилась:', event, data)
})

// Отписаться
unsubscribe()
```

## Миграция данных

Если у вас уже есть данные в старом формате localStorage, они будут автоматически мигрированы при первом использовании базы данных.
