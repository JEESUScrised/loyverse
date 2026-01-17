import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'loyverse.db'))

// Get all venues
const venues = db.prepare('SELECT id, name FROM venues').all()

if (venues.length === 0) {
  console.log('Нет заведений в базе данных')
  process.exit(0)
}

console.log('Найдено заведений:', venues.length)
console.log('\nОбновление всех подписок на Pro тариф...\n')

// Update all subscriptions to Pro
const updateStmt = db.prepare(`
  INSERT OR REPLACE INTO subscriptions (venueId, endDate, plan, updatedAt)
  VALUES (?, ?, ?, CURRENT_TIMESTAMP)
`)

const endDate = new Date()
endDate.setDate(endDate.getDate() + 365) // 1 year

let updated = 0
for (const venue of venues) {
  updateStmt.run(venue.id, endDate.toISOString(), 'pro')
  console.log(`✓ ${venue.name} (ID: ${venue.id}) - обновлено на Pro`)
  updated++
}

console.log(`\n✅ Успешно обновлено ${updated} подписок на Pro тариф`)
console.log(`Дата окончания: ${endDate.toISOString().split('T')[0]}`)

db.close()

