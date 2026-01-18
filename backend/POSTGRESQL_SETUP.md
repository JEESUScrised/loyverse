# Настройка PostgreSQL для проекта Loyverse

## Проект использует PostgreSQL

Проект использует PostgreSQL через библиотеку `pg`. Подключение настраивается через переменные окружения.

## Настройка переменных окружения

Создайте файл `backend/.env` с одним из вариантов:

### Вариант 1: Строка подключения (для Railway/Render)

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

### Вариант 2: Отдельные переменные (для локальной разработки)

```env
PG_HOST=localhost
PG_PORT=5432
PG_DB=loyverse
PG_USER=postgres
PG_PASSWORD=your_password
```

## Проверка подключения

```bash
cd backend
node connect-postgres.js
```

## Установка PostgreSQL локально (если нужно)

1. **Скачайте PostgreSQL:**
   - Перейдите на https://www.postgresql.org/download/windows/
   - Скачайте установщик
   - Установите PostgreSQL (включите установку командной строки)

2. **Создайте базу данных:**
   ```bash
   # Полный путь к psql (замените версию на свою)
   "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
   
   # В psql выполните:
   CREATE DATABASE loyverse;
   \q
   ```

3. **Добавьте в `.env`:**
   ```env
   PG_HOST=localhost
   PG_PORT=5432
   PG_DB=loyverse
   PG_USER=postgres
   PG_PASSWORD=your_password
   ```

### Вариант 3: Использовать pgAdmin (GUI)

1. Скачайте pgAdmin с https://www.pgadmin.org/download/
2. Установите и используйте графический интерфейс

### Вариант 4: Подключение к удаленной базе (Railway/Render)

Если база данных на Railway или Render:

1. **Получите строку подключения из панели управления**
2. **Используйте Node.js скрипт:**
   ```javascript
   const client = new Client({
     connectionString: 'postgresql://user:password@host:port/database'
   })
   ```

## Удаление npm пакета psql

Если нужно удалить неправильный npm пакет:
```bash
npm uninstall -g psql
```

## Проверка установки PostgreSQL

```powershell
# Проверить, установлен ли PostgreSQL
Get-Service -Name "*postgres*"

# Найти psql.exe
Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe"
```
