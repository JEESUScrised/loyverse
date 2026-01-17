import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'loyverse.db'))

// Get all owners
const owners = db.prepare('SELECT * FROM owners').all()

console.log('Все владельцы в базе:')
console.log('===================\n')

if (owners.length === 0) {
  console.log('Нет владельцев в базе данных')
} else {
  owners.forEach(owner => {
    console.log(`Telegram ID: ${owner.telegramId}`)
    console.log(`  Plan: ${owner.plan}`)
    console.log(`  Subscription Status: ${owner.subscriptionStatus}`)
    console.log(`  Subscription End Date: ${owner.subscriptionEndDate || 'нет'}`)
    console.log('')
  })
}

db.close()
