import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'loyverse.db'))

// Get all owners
const owners = db.prepare('SELECT telegramId, plan, subscriptionStatus FROM owners').all()

if (owners.length === 0) {
  console.log('Нет владельцев в базе данных')
  console.log('Владелец будет создан при первом входе в приложение')
  process.exit(0)
}

console.log('Найдено владельцев:', owners.length)
console.log('\nОтключение Pro подписки у всех владельцев...\n')

// Update all owners to remove pro subscription
const updateOwnerStmt = db.prepare(`
  UPDATE owners 
  SET subscriptionStatus = 'inactive',
      subscriptionEndDate = NULL,
      plan = 'start',
      updatedAt = CURRENT_TIMESTAMP
  WHERE telegramId = ?
`)

// Update all venue subscriptions to start
const updateVenueStmt = db.prepare(`
  UPDATE subscriptions 
  SET plan = 'start',
      updatedAt = CURRENT_TIMESTAMP
  WHERE venueId IN (
    SELECT venueId FROM owner_venues WHERE ownerId = ?
  )
`)

let updated = 0
for (const owner of owners) {
  updateOwnerStmt.run(owner.telegramId)
  updateVenueStmt.run(owner.telegramId)
  console.log(`✓ Владелец ${owner.telegramId} - Pro подписка отключена`)
  updated++
}

console.log(`\n✅ Успешно отключено ${updated} Pro подписок`)
console.log('Все владельцы переведены на план "start"')

db.close()
