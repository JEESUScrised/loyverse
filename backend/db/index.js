import { Pool } from 'pg'

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
      database: process.env.PG_DB,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD
    })

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS venues (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      photo TEXT,
      description TEXT,
      "pointsPerVisit" INTEGER DEFAULT 10,
      "pointsType" TEXT DEFAULT 'common',
      "pointsExpirationDays" INTEGER DEFAULT 0,
      "happyHoursSchedule" TEXT,
      "ownerId" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      "venueId" INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      category TEXT DEFAULT 'Main dishes',
      image TEXT,
      weight TEXT,
      description TEXT,
      composition TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cashiers (
      id TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      "telegramId" TEXT UNIQUE,
      "venueId" INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
      "venueName" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      "telegramId" TEXT UNIQUE,
      points INTEGER DEFAULT 3000,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_venue_points (
      "userId" TEXT NOT NULL,
      "venueId" INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
      points INTEGER DEFAULT 0,
      PRIMARY KEY ("userId", "venueId")
    );

    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      "userId" TEXT,
      "telegramId" TEXT,
      "venueId" INTEGER REFERENCES venues(id) ON DELETE SET NULL,
      "venueName" TEXT,
      points INTEGER,
      "menuItemId" INTEGER,
      "menuItemName" TEXT,
      "cashierId" TEXT,
      "date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "earnedDate" TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      "venueId" INTEGER PRIMARY KEY REFERENCES venues(id) ON DELETE CASCADE,
      "endDate" TIMESTAMP NOT NULL,
      plan TEXT DEFAULT 'start',
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS owner_venues (
      "ownerId" TEXT NOT NULL,
      "venueId" INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
      PRIMARY KEY ("ownerId", "venueId")
    );

    CREATE TABLE IF NOT EXISTS owners (
      "telegramId" TEXT PRIMARY KEY,
      "subscriptionStatus" TEXT DEFAULT 'inactive',
      "subscriptionEndDate" TIMESTAMP,
      plan TEXT DEFAULT 'start',
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

export { initDb, pool }
