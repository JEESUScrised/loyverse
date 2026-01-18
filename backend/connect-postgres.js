// Скрипт для подключения к PostgreSQL базе данных
// Использование: node connect-postgres.js

import 'dotenv/config'
import { Pool } from 'pg'

// Используем ту же логику подключения, что и в db/index.js
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
      database: process.env.PG_DB,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD
    })

async function testConnection() {
  try {
    console.log('Попытка подключения к PostgreSQL...')
    console.log('Используется:', process.env.DATABASE_URL ? 'DATABASE_URL' : 'отдельные переменные')
    
    const result = await pool.query('SELECT version()')
    console.log('✅ Подключено к PostgreSQL')
    console.log('Версия:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1])
    
    // Проверка таблиц
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    console.log(`\nНайдено таблиц: ${tables.rows.length}`)
    if (tables.rows.length > 0) {
      console.log('Таблицы:', tables.rows.map(r => r.table_name).join(', '))
    }
    
    await pool.end()
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message)
    console.error('\nПроверьте переменные окружения в .env файле:')
    console.error('  - DATABASE_URL (строка подключения)')
    console.error('  ИЛИ отдельные переменные:')
    console.error('  - PG_HOST')
    console.error('  - PG_PORT')
    console.error('  - PG_DB')
    console.error('  - PG_USER')
    console.error('  - PG_PASSWORD')
    process.exit(1)
  }
}

testConnection()
