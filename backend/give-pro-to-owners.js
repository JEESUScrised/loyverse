import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'loyverse.db'))

// Get all owners
const owners = db.prepare('SELECT telegramId FROM owners').all()

if (owners.length === 0) {
  console.log('Нет владельцев в базе данных')
  console.log('Владелец будет создан при первом входе в приложение')
  process.exit(0)
}

console.log('Найдено владельцев:', owners.length)
console.log('\nВключение Pro подписки для всех владельцев...\n')

// Calculate subscription end date (1 year from now)
const endDate = new Date()
endDate.setDate(endDate.getDate() + 365) // 1 year

// Update all owners to pro
const updateOwnerStmt = db.prepare(`
  UPDATE owners 
  SET subscriptionStatus = 'active',
      subscriptionEndDate = ?,
      plan = 'pro',
      updatedAt = CURRENT_TIMESTAMP
  WHERE telegramId = ?
`)

// Update all venue subscriptions to pro
const updateVenueStmt = db.prepare(`
  INSERT OR REPLACE INTO subscriptions (venueId, endDate, plan, updatedAt)
  VALUES (?, ?, 'pro', CURRENT_TIMESTAMP)
`)

// Get all venues for each owner
const getVenuesStmt = db.prepare(`
  SELECT v.id FROM venues v
  JOIN owner_venues ov ON v.id = ov.venueId
  WHERE ov.ownerId = ?
`)

let updated = 0
for (const owner of owners) {
  // Update owner subscription
  updateOwnerStmt.run(endDate.toISOString(), owner.telegramId)
  
  // Update all venues owned by this owner
  const venues = getVenuesStmt.all(owner.telegramId)
  venues.forEach(venue => {
    updateVenueStmt.run(venue.id, endDate.toISOString())
  })
  
  console.log(`✓ Владелец ${owner.telegramId} - Pro подписка включена`)
  if (venues.length > 0) {
    console.log(`  Заведений обновлено: ${venues.length}`)
  }
  updated++
}

console.log(`\n✅ Успешно включено ${updated} Pro подписок`)
console.log(`Дата окончания: ${endDate.toISOString().split('T')[0]}`)
console.log(`Срок действия: 365 дней`)

db.close()
