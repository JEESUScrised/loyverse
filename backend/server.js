import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3004

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'loyverse.db'))

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS venues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    photo TEXT,
    description TEXT,
    pointsPerVisit INTEGER DEFAULT 10,
    pointsType TEXT DEFAULT 'common',
    pointsExpirationDays INTEGER DEFAULT 0,
    happyHoursSchedule TEXT,
    ownerId TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venueId INTEGER NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT DEFAULT 'Основные блюда',
    image TEXT,
    weight TEXT,
    description TEXT,
    composition TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venueId) REFERENCES venues(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cashiers (
    id TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    telegramId TEXT UNIQUE,
    venueId INTEGER NOT NULL,
    venueName TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venueId) REFERENCES venues(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    telegramId TEXT UNIQUE,
    points INTEGER DEFAULT 3000,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_venue_points (
    userId TEXT NOT NULL,
    venueId INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    PRIMARY KEY (userId, venueId),
    FOREIGN KEY (venueId) REFERENCES venues(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    userId TEXT,
    telegramId TEXT,
    venueId INTEGER,
    venueName TEXT,
    points INTEGER,
    menuItemId INTEGER,
    menuItemName TEXT,
    cashierId TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    earnedDate TEXT,
    FOREIGN KEY (venueId) REFERENCES venues(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    venueId INTEGER PRIMARY KEY,
    endDate TEXT NOT NULL,
    plan TEXT DEFAULT 'start',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venueId) REFERENCES venues(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS owner_venues (
    ownerId TEXT NOT NULL,
    venueId INTEGER NOT NULL,
    PRIMARY KEY (ownerId, venueId),
    FOREIGN KEY (venueId) REFERENCES venues(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS owners (
    telegramId TEXT PRIMARY KEY,
    subscriptionStatus TEXT DEFAULT 'inactive',
    subscriptionEndDate TEXT,
    plan TEXT DEFAULT 'start',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`)

// Migration: Add cashierId column to activities if it doesn't exist
try {
  db.prepare('ALTER TABLE activities ADD COLUMN cashierId TEXT').run()
} catch (e) {
  // Column already exists, ignore
}

// Migration: Add plan column to subscriptions if it doesn't exist
try {
  db.prepare('ALTER TABLE subscriptions ADD COLUMN plan TEXT DEFAULT "start"').run()
} catch (e) {
  // Column already exists, ignore
}

// Migration: Add pointsExpirationDays column to venues if it doesn't exist
try {
  db.prepare('ALTER TABLE venues ADD COLUMN pointsExpirationDays INTEGER DEFAULT 0').run()
} catch (e) {
  // Column already exists, ignore
}

// Migration: Add earnedDate column to activities if it doesn't exist
try {
  db.prepare('ALTER TABLE activities ADD COLUMN earnedDate TEXT').run()
} catch (e) {
  // Column already exists, ignore
}

// Migration: Add happyHoursSchedule column to venues if it doesn't exist
try {
  db.prepare('ALTER TABLE venues ADD COLUMN happyHoursSchedule TEXT').run()
} catch (e) {
  // Column already exists, ignore
}

// Migration: Add telegramId column to cashiers if it doesn't exist
try {
  db.prepare('ALTER TABLE cashiers ADD COLUMN telegramId TEXT UNIQUE').run()
} catch (e) {
  // Column already exists, ignore
}

// Migration: Add weight, description, composition columns to menu_items if they don't exist
try {
  db.prepare('ALTER TABLE menu_items ADD COLUMN weight TEXT').run()
} catch (e) {
  // Column already exists, ignore
}

try {
  db.prepare('ALTER TABLE menu_items ADD COLUMN description TEXT').run()
} catch (e) {
  // Column already exists, ignore
}

try {
  db.prepare('ALTER TABLE menu_items ADD COLUMN composition TEXT').run()
} catch (e) {
  // Column already exists, ignore
}

// ==================== TELEGRAM VALIDATION ====================

// Bot tokens configuration
const BOT_TOKENS = {
  client: process.env.TELEGRAM_CLIENT_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || 'YOUR_CLIENT_BOT_TOKEN',
  owner: process.env.TELEGRAM_OWNER_BOT_TOKEN || 'YOUR_OWNER_BOT_TOKEN',
  cashier: process.env.TELEGRAM_CASHIER_BOT_TOKEN || 'YOUR_CASHIER_BOT_TOKEN'
}

// Validate Telegram WebApp initData
function validateTelegramInitData(initData, botToken) {
  try {
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    urlParams.delete('hash')
    
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
    
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()
    
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')
    
    return calculatedHash === hash
  } catch (error) {
    console.error('Error validating Telegram initData:', error)
    return false
  }
}

// Validate initData for specific bot type
function validateInitDataForBot(initData, botType) {
  const botToken = BOT_TOKENS[botType]
  if (!botToken || botToken.startsWith('YOUR_')) {
    // In development, skip validation if token not set
    console.warn(`Bot token for ${botType} not configured, skipping validation`)
    return true
  }
  return validateTelegramInitData(initData, botToken)
}

// Extract telegramId from initData
function extractTelegramId(initData) {
  try {
    const urlParams = new URLSearchParams(initData)
    const userStr = urlParams.get('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user.id?.toString()
    }
    return null
  } catch (error) {
    console.error('Error extracting telegramId:', error)
    return null
  }
}

// ==================== OWNERS ====================

// Get or create owner by telegramId
app.post('/api/owners/auth', (req, res) => {
  try {
    const { initData } = req.body
    
    if (!initData) {
      return res.status(400).json({ error: 'initData is required' })
    }
    
    // Validate initData for owner bot
    if (!validateInitDataForBot(initData, 'owner')) {
      return res.status(401).json({ error: 'Invalid initData' })
    }
    
    const telegramId = extractTelegramId(initData)
    if (!telegramId) {
      return res.status(400).json({ error: 'Could not extract telegramId from initData' })
    }
    
    // Get or create owner
    let owner = db.prepare('SELECT * FROM owners WHERE telegramId = ?').get(telegramId)
    
    if (!owner) {
      db.prepare(`
        INSERT INTO owners (telegramId, subscriptionStatus, plan)
        VALUES (?, 'inactive', 'start')
      `).run(telegramId)
      owner = db.prepare('SELECT * FROM owners WHERE telegramId = ?').get(telegramId)
    }
    
    // Check subscription status
    const now = new Date().toISOString()
    if (owner.subscriptionEndDate && owner.subscriptionEndDate > now) {
      owner.subscriptionStatus = 'active'
    } else {
      owner.subscriptionStatus = 'inactive'
      db.prepare(`
        UPDATE owners 
        SET subscriptionStatus = 'inactive', updatedAt = CURRENT_TIMESTAMP
        WHERE telegramId = ?
      `).run(telegramId)
    }
    
    res.json(owner)
  } catch (error) {
    console.error('Error authenticating owner:', error)
    res.status(500).json({ error: 'Failed to authenticate owner' })
  }
})

// Get owner by telegramId
app.get('/api/owners/:telegramId', (req, res) => {
  try {
    const owner = db.prepare('SELECT * FROM owners WHERE telegramId = ?').get(req.params.telegramId)
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' })
    }
    
    // Check subscription status
    const now = new Date().toISOString()
    if (owner.subscriptionEndDate && owner.subscriptionEndDate > now) {
      owner.subscriptionStatus = 'active'
    } else {
      owner.subscriptionStatus = 'inactive'
    }
    
    res.json(owner)
  } catch (error) {
    console.error('Error fetching owner:', error)
    res.status(500).json({ error: 'Failed to fetch owner' })
  }
})

// Check owner access (middleware helper)
function checkOwnerAccess(telegramId) {
  const owner = db.prepare('SELECT * FROM owners WHERE telegramId = ?').get(telegramId)
  if (!owner) return { allowed: false, reason: 'Owner not found' }
  
  const now = new Date().toISOString()
  const isActive = owner.subscriptionEndDate && owner.subscriptionEndDate > now
  
  return {
    allowed: isActive,
    owner,
    reason: isActive ? null : 'Subscription expired or inactive'
  }
}

// ==================== CLIENTS ====================

// Authenticate client by telegramId
app.post('/api/clients/auth', (req, res) => {
  try {
    const { initData } = req.body
    
    if (!initData) {
      return res.status(400).json({ error: 'initData is required' })
    }
    
    // Validate initData for client bot
    if (!validateInitDataForBot(initData, 'client')) {
      return res.status(401).json({ error: 'Invalid initData' })
    }
    
    const telegramId = extractTelegramId(initData)
    if (!telegramId) {
      return res.status(400).json({ error: 'Could not extract telegramId from initData' })
    }
    
    // Get or create user
    let user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get(telegramId)
    
    if (!user) {
      db.prepare('INSERT INTO users (id, telegramId, points) VALUES (?, ?, ?)').run(telegramId, telegramId, 3000)
      user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get(telegramId)
    }
    
    res.json(user)
  } catch (error) {
    console.error('Error authenticating client:', error)
    res.status(500).json({ error: 'Failed to authenticate client' })
  }
})

// ==================== CASHIERS AUTH ====================

// Authenticate cashier by telegramId
app.post('/api/cashiers/auth', (req, res) => {
  try {
    const { initData } = req.body
    
    if (!initData) {
      return res.status(400).json({ error: 'initData is required' })
    }
    
    // Validate initData for cashier bot
    if (!validateInitDataForBot(initData, 'cashier')) {
      return res.status(401).json({ error: 'Invalid initData' })
    }
    
    const telegramId = extractTelegramId(initData)
    if (!telegramId) {
      return res.status(400).json({ error: 'Could not extract telegramId from initData' })
    }
    
    // Find cashier by telegramId
    const cashier = db.prepare('SELECT * FROM cashiers WHERE telegramId = ?').get(telegramId)
    
    if (!cashier) {
      return res.status(404).json({ error: 'Cashier not found' })
    }
    
    // Return cashier data (without password)
    const { password, ...cashierData } = cashier
    res.json(cashierData)
  } catch (error) {
    console.error('Error authenticating cashier:', error)
    res.status(500).json({ error: 'Failed to authenticate cashier' })
  }
})

// ==================== YOOKASSA PAYMENTS ====================

// Create payment
app.post('/api/payments/create', async (req, res) => {
  try {
    const { telegramId, plan, amount } = req.body
    
    if (!telegramId || !plan) {
      return res.status(400).json({ error: 'telegramId and plan are required' })
    }
    
    // Calculate subscription duration (30 days for pro)
    const subscriptionDays = plan === 'pro' ? 30 : 0
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + subscriptionDays)
    
    // In production, create payment via YooKassa API
    // For now, we'll create a mock payment
    const paymentId = uuidv4()
    
    // Store pending payment
    // In production, use YooKassa payment ID
    const paymentData = {
      id: paymentId,
      telegramId,
      plan,
      amount: amount || (plan === 'pro' ? 990 : 0),
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    // In production, create payment in YooKassa and return payment URL
    // For development, we'll simulate immediate success
    res.json({
      paymentId,
      paymentUrl: `https://yookassa.ru/checkout/payments/${paymentId}`, // Mock URL
      amount: paymentData.amount
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    res.status(500).json({ error: 'Failed to create payment' })
  }
})

// YooKassa webhook handler
app.post('/api/payments/webhook', (req, res) => {
  try {
    const { event, object } = req.body
    
    // In production, verify webhook signature from YooKassa
    if (event === 'payment.succeeded' && object.status === 'succeeded') {
      const paymentId = object.id
      const metadata = object.metadata || {}
      const telegramId = metadata.telegramId
      const plan = metadata.plan || 'pro'
      
      if (telegramId) {
        // Calculate subscription end date
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 30) // 30 days for pro
        
        // Update owner subscription
        db.prepare(`
          UPDATE owners 
          SET subscriptionStatus = 'active',
              subscriptionEndDate = ?,
              plan = ?,
              updatedAt = CURRENT_TIMESTAMP
          WHERE telegramId = ?
        `).run(endDate.toISOString(), plan, telegramId)
        
        // Update all venues owned by this owner to pro
        const venues = db.prepare(`
          SELECT v.id FROM venues v
          JOIN owner_venues ov ON v.id = ov.venueId
          WHERE ov.ownerId = ?
        `).all(telegramId)
        
        venues.forEach(venue => {
          db.prepare(`
            INSERT OR REPLACE INTO subscriptions (venueId, endDate, plan, updatedAt)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          `).run(venue.id, endDate.toISOString(), plan)
        })
      }
    }
    
    res.status(200).send('OK')
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Failed to process webhook' })
  }
})

// ==================== VENUES ====================

// Get all venues
app.get('/api/venues', (req, res) => {
  try {
    const venues = db.prepare('SELECT * FROM venues ORDER BY createdAt DESC').all()
    
    // Get menu items for each venue
    const getMenuItems = db.prepare('SELECT * FROM menu_items WHERE venueId = ?')
    const result = venues.map(venue => {
      const venueData = { ...venue }
      // Parse happyHoursSchedule if it exists
      if (venueData.happyHoursSchedule) {
        try {
          venueData.happyHoursSchedule = typeof venueData.happyHoursSchedule === 'string' 
            ? JSON.parse(venueData.happyHoursSchedule) 
            : venueData.happyHoursSchedule
        } catch (e) {
          venueData.happyHoursSchedule = null
        }
      }
      // Check if currently in happy hour
      venueData.isHappyHour = isHappyHour(venueData)
      venueData.menu = getMenuItems.all(venue.id)
      return venueData
    })
    
    res.json(result)
  } catch (error) {
    console.error('Error fetching venues:', error)
    res.status(500).json({ error: 'Failed to fetch venues' })
  }
})

// Get venue by ID
app.get('/api/venues/:id', (req, res) => {
  try {
    const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id)
    
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' })
    }
    
    const menuItems = db.prepare('SELECT * FROM menu_items WHERE venueId = ?').all(venue.id)
    
    // Parse happyHoursSchedule if it exists
    let happyHoursSchedule = null
    if (venue.happyHoursSchedule) {
      try {
        happyHoursSchedule = typeof venue.happyHoursSchedule === 'string' 
          ? JSON.parse(venue.happyHoursSchedule) 
          : venue.happyHoursSchedule
      } catch (e) {
        happyHoursSchedule = null
      }
    }
    
    // Check if currently in happy hour
    const isHappyHourNow = isHappyHour(venue)
    
    res.json({ 
      ...venue, 
      menu: menuItems,
      happyHoursSchedule,
      isHappyHour: isHappyHourNow
    })
  } catch (error) {
    console.error('Error fetching venue:', error)
    res.status(500).json({ error: 'Failed to fetch venue' })
  }
})

// Create venue
app.post('/api/venues', (req, res) => {
  try {
    const { name, address, photo, description, pointsPerVisit, pointsType, pointsExpirationDays, happyHoursSchedule, ownerId, telegramId, menu } = req.body
    
    // Use telegramId if provided, otherwise use ownerId
    const finalOwnerId = telegramId || ownerId
    
    const stmt = db.prepare(`
      INSERT INTO venues (name, address, photo, description, pointsPerVisit, pointsType, pointsExpirationDays, happyHoursSchedule, ownerId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      name, address, photo, description, 
      pointsPerVisit || 10, 
      pointsType || 'common', 
      pointsExpirationDays || 0,
      happyHoursSchedule ? JSON.stringify(happyHoursSchedule) : null,
      finalOwnerId
    )
    const venueId = result.lastInsertRowid
    
    // Link venue to owner if telegramId provided
    if (finalOwnerId) {
      db.prepare('INSERT OR IGNORE INTO owner_venues (ownerId, venueId) VALUES (?, ?)').run(finalOwnerId, venueId)
    }
    
    // Add menu items
    if (menu && Array.isArray(menu)) {
      const menuStmt = db.prepare(`
        INSERT INTO menu_items (venueId, name, price, category, image, weight, description, composition)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      for (const item of menu) {
        menuStmt.run(
          venueId, 
          item.name, 
          item.price, 
          item.category || 'Основные блюда', 
          item.image,
          item.weight || null,
          item.description || null,
          item.composition || null
        )
      }
    }
    
    // Add to owner_venues if ownerId provided
    if (ownerId) {
      db.prepare('INSERT OR IGNORE INTO owner_venues (ownerId, venueId) VALUES (?, ?)').run(ownerId, venueId)
    }
    
    // Set default subscription (30 days, Start plan)
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)
    db.prepare('INSERT OR REPLACE INTO subscriptions (venueId, endDate, plan) VALUES (?, ?, ?)').run(venueId, endDate.toISOString(), 'start')
    
    const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(venueId)
    const menuItems = db.prepare('SELECT * FROM menu_items WHERE venueId = ?').all(venueId)
    
    res.status(201).json({ ...venue, menu: menuItems })
  } catch (error) {
    console.error('Error creating venue:', error)
    res.status(500).json({ error: 'Failed to create venue' })
  }
})

// Update venue
app.put('/api/venues/:id', (req, res) => {
  try {
    const { name, address, photo, description, pointsPerVisit, pointsType, pointsExpirationDays, happyHoursSchedule, menu } = req.body
    const venueId = req.params.id
    
    db.prepare(`
      UPDATE venues 
      SET name = ?, address = ?, photo = ?, description = ?, pointsPerVisit = ?, pointsType = ?, pointsExpirationDays = ?, happyHoursSchedule = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name, address, photo, description, 
      pointsPerVisit, pointsType, 
      pointsExpirationDays || 0,
      happyHoursSchedule ? JSON.stringify(happyHoursSchedule) : null,
      venueId
    )
    
    // Update menu items
    if (menu && Array.isArray(menu)) {
      db.prepare('DELETE FROM menu_items WHERE venueId = ?').run(venueId)
      
      const menuStmt = db.prepare(`
        INSERT INTO menu_items (venueId, name, price, category, image, weight, description, composition)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      for (const item of menu) {
        menuStmt.run(
          venueId, 
          item.name, 
          item.price, 
          item.category || 'Основные блюда', 
          item.image,
          item.weight || null,
          item.description || null,
          item.composition || null
        )
      }
    }
    
    const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(venueId)
    const menuItems = db.prepare('SELECT * FROM menu_items WHERE venueId = ?').all(venueId)
    
    res.json({ ...venue, menu: menuItems })
  } catch (error) {
    console.error('Error updating venue:', error)
    res.status(500).json({ error: 'Failed to update venue' })
  }
})

// Delete venue
app.delete('/api/venues/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM venues WHERE id = ?').run(req.params.id)
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting venue:', error)
    res.status(500).json({ error: 'Failed to delete venue' })
  }
})

// ==================== CASHIERS ====================

// Get cashiers by venue
app.get('/api/venues/:venueId/cashiers', (req, res) => {
  try {
    const cashiers = db.prepare('SELECT id, venueId, venueName, createdAt FROM cashiers WHERE venueId = ?').all(req.params.venueId)
    res.json(cashiers)
  } catch (error) {
    console.error('Error fetching cashiers:', error)
    res.status(500).json({ error: 'Failed to fetch cashiers' })
  }
})

// Create cashier
app.post('/api/cashiers', (req, res) => {
  try {
    const { id, password, telegramId, venueId, venueName } = req.body
    
    if (!id || !password || !venueId) {
      return res.status(400).json({ error: 'ID, password, and venueId are required' })
    }
    
    // Check if cashier already exists
    const existing = db.prepare('SELECT id, venueId FROM cashiers WHERE id = ?').get(id)
    if (existing) {
      // If cashier exists and belongs to the same venue, update password
      if (existing.venueId === venueId) {
        db.prepare(`
          UPDATE cashiers 
          SET password = ?, venueName = ?, telegramId = ?
          WHERE id = ?
        `).run(password, venueName, telegramId || null, id)
        return res.json({ id, telegramId, venueId, venueName, updated: true })
      } else {
        return res.status(400).json({ error: 'Cashier with this ID already exists in another venue' })
      }
    }
    
    // Check if telegramId already exists (only if provided)
    if (telegramId) {
      const existingByTelegram = db.prepare('SELECT id FROM cashiers WHERE telegramId = ?').get(telegramId)
      if (existingByTelegram) {
        return res.status(400).json({ error: 'Cashier with this Telegram ID already exists' })
      }
    }
    
    db.prepare(`
      INSERT INTO cashiers (id, password, telegramId, venueId, venueName)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, password, telegramId || null, venueId, venueName)
    
    res.status(201).json({ id, telegramId, venueId, venueName, createdAt: new Date().toISOString() })
  } catch (error) {
    console.error('Error creating cashier:', error)
    res.status(500).json({ error: 'Failed to create cashier' })
  }
})

// Login cashier
app.post('/api/cashiers/login', (req, res) => {
  try {
    const { id, password } = req.body
    
    const cashier = db.prepare('SELECT id, venueId, venueName FROM cashiers WHERE id = ? AND password = ?').get(id, password)
    
    if (!cashier) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    res.json(cashier)
  } catch (error) {
    console.error('Error logging in cashier:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
})

// Delete cashier
app.delete('/api/cashiers/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM cashiers WHERE id = ?').run(req.params.id)
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting cashier:', error)
    res.status(500).json({ error: 'Failed to delete cashier' })
  }
})

// ==================== USERS ====================

// Get or create user
app.get('/api/users/:id', (req, res) => {
  try {
    let user = db.prepare('SELECT * FROM users WHERE id = ? OR telegramId = ?').get(req.params.id, req.params.id)
    
    if (!user) {
      // Create new user with default points
      db.prepare('INSERT INTO users (id, telegramId, points) VALUES (?, ?, ?)').run(req.params.id, req.params.id, 3000)
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
    }
    
    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Update user points
app.put('/api/users/:id/points', (req, res) => {
  try {
    const { points } = req.body
    
    db.prepare('UPDATE users SET points = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? OR telegramId = ?')
      .run(points, req.params.id, req.params.id)
    
    res.json({ success: true, points })
  } catch (error) {
    console.error('Error updating user points:', error)
    res.status(500).json({ error: 'Failed to update points' })
  }
})

// Get user venue points (personal points)
app.get('/api/users/:id/venue-points', (req, res) => {
  try {
    const rows = db.prepare('SELECT venueId, points FROM user_venue_points WHERE userId = ?').all(req.params.id)
    const venuePoints = {}
    rows.forEach(row => {
      venuePoints[row.venueId] = row.points
    })
    res.json(venuePoints)
  } catch (error) {
    console.error('Error fetching user venue points:', error)
    res.status(500).json({ error: 'Failed to fetch venue points' })
  }
})

// Update user venue points
app.put('/api/users/:id/venue-points', (req, res) => {
  try {
    const venuePoints = req.body
    
    for (const [venueId, points] of Object.entries(venuePoints)) {
      db.prepare(`
        INSERT OR REPLACE INTO user_venue_points (userId, venueId, points)
        VALUES (?, ?, ?)
      `).run(req.params.id, venueId, points)
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error updating user venue points:', error)
    res.status(500).json({ error: 'Failed to update venue points' })
  }
})

// ==================== ACTIVITIES ====================

// Get activities (with optional filters)
app.get('/api/activities', (req, res) => {
  try {
    const { userId, venueId, type, limit = 50 } = req.query
    
    let sql = 'SELECT * FROM activities WHERE 1=1'
    const params = []
    
    if (userId) {
      sql += ' AND (userId = ? OR telegramId = ?)'
      params.push(userId, userId)
    }
    if (venueId) {
      sql += ' AND venueId = ?'
      params.push(venueId)
    }
    if (type) {
      sql += ' AND type = ?'
      params.push(type)
    }
    
    sql += ' ORDER BY date DESC LIMIT ?'
    params.push(parseInt(limit))
    
    const activities = db.prepare(sql).all(...params)
    res.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})

// Add activity
app.post('/api/activities', (req, res) => {
  try {
    const { type, userId, telegramId, venueId, venueName, points, menuItemId, menuItemName, cashierId } = req.body
    
    const result = db.prepare(`
      INSERT INTO activities (type, userId, telegramId, venueId, venueName, points, menuItemId, menuItemName, cashierId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(type, userId, telegramId, venueId, venueName, points, menuItemId, menuItemName, cashierId || null)
    
    res.status(201).json({ id: result.lastInsertRowid, ...req.body })
  } catch (error) {
    console.error('Error adding activity:', error)
    res.status(500).json({ error: 'Failed to add activity' })
  }
})

// ==================== SUBSCRIPTIONS ====================

// Get subscription
app.get('/api/venues/:venueId/subscription', (req, res) => {
  try {
    const subscription = db.prepare('SELECT * FROM subscriptions WHERE venueId = ?').get(req.params.venueId)
    res.json(subscription || null)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    res.status(500).json({ error: 'Failed to fetch subscription' })
  }
})

// Update subscription
app.put('/api/venues/:venueId/subscription', (req, res) => {
  try {
    const { endDate, plan } = req.body
    
    // Get existing subscription to preserve plan if not provided
    const existing = db.prepare('SELECT plan FROM subscriptions WHERE venueId = ?').get(req.params.venueId)
    const planToUse = plan || existing?.plan || 'start'
    
    db.prepare(`
      INSERT OR REPLACE INTO subscriptions (venueId, endDate, plan, updatedAt)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(req.params.venueId, endDate, planToUse)
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error updating subscription:', error)
    res.status(500).json({ error: 'Failed to update subscription' })
  }
})

// ==================== OWNER VENUES ====================

// Get owner's venues
app.get('/api/owners/:ownerId/venues', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT v.* FROM venues v
      JOIN owner_venues ov ON v.id = ov.venueId
      WHERE ov.ownerId = ?
    `).all(req.params.ownerId)
    
    // Get menu items for each venue
    const getMenuItems = db.prepare('SELECT * FROM menu_items WHERE venueId = ?')
    const result = rows.map(venue => {
      const venueData = { ...venue }
      // Parse happyHoursSchedule if it exists
      if (venueData.happyHoursSchedule) {
        try {
          venueData.happyHoursSchedule = typeof venueData.happyHoursSchedule === 'string' 
            ? JSON.parse(venueData.happyHoursSchedule) 
            : venueData.happyHoursSchedule
        } catch (e) {
          venueData.happyHoursSchedule = null
        }
      }
      // Check if currently in happy hour
      venueData.isHappyHour = isHappyHour(venueData)
      venueData.menu = getMenuItems.all(venue.id)
      return venueData
    })
    
    res.json(result)
  } catch (error) {
    console.error('Error fetching owner venues:', error)
    res.status(500).json({ error: 'Failed to fetch owner venues' })
  }
})

// Add venue to owner
app.post('/api/owners/:ownerId/venues/:venueId', (req, res) => {
  try {
    db.prepare('INSERT OR IGNORE INTO owner_venues (ownerId, venueId) VALUES (?, ?)').run(req.params.ownerId, req.params.venueId)
    res.json({ success: true })
  } catch (error) {
    console.error('Error adding owner venue:', error)
    res.status(500).json({ error: 'Failed to add venue to owner' })
  }
})

// ==================== HAPPY HOURS ====================

// Helper function to check if current time is within happy hours
function isHappyHour(venue) {
  if (!venue.happyHoursSchedule) {
    return false
  }
  
  try {
    const now = new Date()
    // Convert JavaScript day (0 = Sunday, 1 = Monday) to our format (1 = Monday, 7 = Sunday)
    const jsDay = now.getDay()
    const currentDay = jsDay === 0 ? 7 : jsDay
    const currentTime = now.getHours() * 60 + now.getMinutes() // minutes since midnight
    
    const schedule = typeof venue.happyHoursSchedule === 'string' 
      ? JSON.parse(venue.happyHoursSchedule) 
      : venue.happyHoursSchedule
    
    if (!schedule || typeof schedule !== 'object') {
      return false
    }
    
    const daySchedule = schedule[currentDay]
    if (!daySchedule || !daySchedule.enabled || !daySchedule.start || !daySchedule.end) {
      return false
    }
    
    const [startHour, startMin] = daySchedule.start.split(':').map(Number)
    const [endHour, endMin] = daySchedule.end.split(':').map(Number)
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin
    
    return currentTime >= startTime && currentTime <= endTime
  } catch (error) {
    console.error('Error checking happy hours:', error)
    return false
  }
}

// ==================== TRANSACTIONS (Points handling) ====================

// Add points to user (from QR scan at venue)
app.post('/api/transactions/earn', (req, res) => {
  try {
    const { userId, venueId, points, venueName } = req.body
    
    // Get venue to check points type
    const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(venueId)
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' })
    }
    
    // Ensure user exists
    let user = db.prepare('SELECT * FROM users WHERE id = ? OR telegramId = ?').get(userId, userId)
    if (!user) {
      db.prepare('INSERT INTO users (id, telegramId, points) VALUES (?, ?, ?)').run(userId, userId, 3000)
      user = { id: userId, points: 3000 }
    }
    
    if (venue.pointsType === 'personal') {
      // Add to personal (venue-specific) points
      const current = db.prepare('SELECT points FROM user_venue_points WHERE userId = ? AND venueId = ?').get(userId, venueId)
      const currentPoints = current ? current.points : 0
      db.prepare(`
        INSERT OR REPLACE INTO user_venue_points (userId, venueId, points)
        VALUES (?, ?, ?)
      `).run(userId, venueId, currentPoints + points)
    } else {
      // Add to common points
      db.prepare('UPDATE users SET points = points + ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? OR telegramId = ?')
        .run(points, userId, userId)
    }
    
    // Log activity with earnedDate
    const { cashierId } = req.body
    const earnedDate = new Date().toISOString()
    db.prepare(`
      INSERT INTO activities (type, userId, telegramId, venueId, venueName, points, cashierId, earnedDate)
      VALUES ('points_earned', ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, userId, venueId, venueName || venue.name, points, cashierId || null, earnedDate)
    
    res.json({ success: true, points, type: venue.pointsType })
  } catch (error) {
    console.error('Error earning points:', error)
    res.status(500).json({ error: 'Failed to earn points' })
  }
})

// Spend points (purchase)
app.post('/api/transactions/spend', (req, res) => {
  try {
    const { userId, venueId, points, menuItemId, menuItemName, pointsType } = req.body
    
    // Ensure user exists
    let user = db.prepare('SELECT * FROM users WHERE id = ? OR telegramId = ?').get(userId, userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    if (pointsType === 'personal') {
      // Spend from personal points
      const current = db.prepare('SELECT points FROM user_venue_points WHERE userId = ? AND venueId = ?').get(userId, venueId)
      const currentPoints = current ? current.points : 0
      
      if (currentPoints < points) {
        return res.status(400).json({ error: 'Insufficient points' })
      }
      
      db.prepare('UPDATE user_venue_points SET points = points - ? WHERE userId = ? AND venueId = ?')
        .run(points, userId, venueId)
    } else {
      // Spend from common points
      if (user.points < points) {
        return res.status(400).json({ error: 'Insufficient points' })
      }
      
      db.prepare('UPDATE users SET points = points - ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? OR telegramId = ?')
        .run(points, userId, userId)
    }
    
    // Get venue name
    const venue = db.prepare('SELECT name FROM venues WHERE id = ?').get(venueId)
    
    // Log activity
    const { cashierId } = req.body
    db.prepare(`
      INSERT INTO activities (type, userId, telegramId, venueId, venueName, points, menuItemId, menuItemName, cashierId)
      VALUES ('purchase', ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, userId, venueId, venue?.name, points, menuItemId, menuItemName, cashierId || null)
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error spending points:', error)
    res.status(500).json({ error: 'Failed to spend points' })
  }
})

// ==================== POINTS EXPIRATION ====================

// Function to expire points for a venue
function expirePointsForVenue(venueId) {
  try {
    const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(venueId)
    if (!venue || !venue.pointsExpirationDays || venue.pointsExpirationDays <= 0) {
      return // No expiration configured
    }
    
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() - venue.pointsExpirationDays)
    const expirationDateStr = expirationDate.toISOString()
    
    // Get all earned points that should expire (not yet expired)
    const expiredActivities = db.prepare(`
      SELECT a.* FROM activities a
      WHERE a.venueId = ? 
        AND a.type = 'points_earned' 
        AND a.earnedDate IS NOT NULL 
        AND a.earnedDate < ?
        AND NOT EXISTS (
          SELECT 1 FROM activities e
          WHERE e.type = 'expired' 
            AND e.userId = a.userId
            AND e.venueId = a.venueId
            AND e.date >= a.earnedDate
            AND e.points >= a.points
        )
      ORDER BY a.earnedDate ASC
    `).all(venueId, expirationDateStr)
    
    for (const activity of expiredActivities) {
      if (!activity.userId || !activity.points) continue
      
      // Check if points still exist
      let currentPoints = 0
      if (venue.pointsType === 'personal') {
        const userVenuePoints = db.prepare('SELECT points FROM user_venue_points WHERE userId = ? AND venueId = ?').get(activity.userId, venueId)
        currentPoints = userVenuePoints ? userVenuePoints.points : 0
      } else {
        const user = db.prepare('SELECT points FROM users WHERE id = ? OR telegramId = ?').get(activity.userId, activity.userId)
        currentPoints = user ? user.points : 0
      }
      
      // Calculate points to expire (can't expire more than user has, and only what was earned in this activity)
      const pointsToExpire = Math.min(activity.points, currentPoints)
      
      if (pointsToExpire > 0) {
        // Deduct expired points
        if (venue.pointsType === 'personal') {
          db.prepare('UPDATE user_venue_points SET points = points - ? WHERE userId = ? AND venueId = ?')
            .run(pointsToExpire, activity.userId, venueId)
        } else {
          db.prepare('UPDATE users SET points = points - ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? OR telegramId = ?')
            .run(pointsToExpire, activity.userId, activity.userId)
        }
        
        // Log expiration activity
        db.prepare(`
          INSERT INTO activities (type, userId, telegramId, venueId, venueName, points, date)
          VALUES ('expired', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(activity.userId, activity.telegramId, venueId, activity.venueName, pointsToExpire)
      }
    }
  } catch (error) {
    console.error(`Error expiring points for venue ${venueId}:`, error)
  }
}

// Function to expire points for all venues
function expireAllPoints() {
  try {
    const venues = db.prepare('SELECT id FROM venues').all()
    for (const venue of venues) {
      expirePointsForVenue(venue.id)
    }
  } catch (error) {
    console.error('Error expiring all points:', error)
  }
}

// Endpoint to manually trigger points expiration (for testing)
app.post('/api/points/expire', (req, res) => {
  try {
    const { venueId } = req.body
    if (venueId) {
      expirePointsForVenue(venueId)
    } else {
      expireAllPoints()
    }
    res.json({ success: true })
  } catch (error) {
    console.error('Error expiring points:', error)
    res.status(500).json({ error: 'Failed to expire points' })
  }
})

// ==================== STATS ====================

// Get venue stats
app.get('/api/venues/:venueId/stats', (req, res) => {
  try {
    const venueId = req.params.venueId
    
    const visits = db.prepare("SELECT COUNT(*) as count FROM activities WHERE venueId = ? AND type = 'points_earned'").get(venueId)
    const pointsIssued = db.prepare("SELECT COALESCE(SUM(points), 0) as total FROM activities WHERE venueId = ? AND type = 'points_earned'").get(venueId)
    const purchases = db.prepare("SELECT COUNT(*) as count FROM activities WHERE venueId = ? AND type = 'purchase'").get(venueId)
    const pointsSpent = db.prepare("SELECT COALESCE(SUM(points), 0) as total FROM activities WHERE venueId = ? AND type = 'purchase'").get(venueId)
    
    // Client stats
    const clientStats = db.prepare(`
      SELECT userId, COUNT(*) as visitCount 
      FROM activities 
      WHERE venueId = ? AND type = 'points_earned' AND userId IS NOT NULL
      GROUP BY userId
    `).all(venueId)
    
    const newClients = clientStats.filter(c => c.visitCount === 1).length
    const returningClients = clientStats.filter(c => c.visitCount >= 2).length
    
    res.json({
      totalVisits: visits.count,
      totalPointsIssued: pointsIssued.total,
      totalPurchases: purchases.count,
      totalPointsSpent: pointsSpent.total,
      newClients,
      returningClients
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// ==================== ANALYTICS ====================

// Get advanced analytics (Pro plan)
app.get('/api/venues/:venueId/analytics', (req, res) => {
  try {
    const venueId = req.params.venueId
    const { period = 'month' } = req.query // day, week, month, quarter
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }
    
    const startDateStr = startDate.toISOString()
    
    // Unique clients
    const uniqueClients = db.prepare(`
      SELECT COUNT(DISTINCT userId) as count 
      FROM activities 
      WHERE venueId = ? AND date >= ? AND userId IS NOT NULL
    `).get(venueId, startDateStr)
    
    // Visits
    const visits = db.prepare(`
      SELECT COUNT(*) as count 
      FROM activities 
      WHERE venueId = ? AND type = 'points_earned' AND date >= ?
    `).get(venueId, startDateStr)
    
    // Points issued
    const pointsIssued = db.prepare(`
      SELECT COALESCE(SUM(points), 0) as total 
      FROM activities 
      WHERE venueId = ? AND type = 'points_earned' AND date >= ?
    `).get(venueId, startDateStr)
    
    // Points spent
    const pointsSpent = db.prepare(`
      SELECT COALESCE(SUM(points), 0) as total 
      FROM activities 
      WHERE venueId = ? AND type = 'purchase' AND date >= ?
    `).get(venueId, startDateStr)
    
    // Points expired
    const pointsExpired = db.prepare(`
      SELECT COALESCE(SUM(points), 0) as total 
      FROM activities 
      WHERE venueId = ? AND type = 'expired' AND date >= ?
    `).get(venueId, startDateStr)
    
    // Active clients (returned in period)
    const activeClients = db.prepare(`
      SELECT COUNT(DISTINCT userId) as count 
      FROM activities 
      WHERE venueId = ? AND date >= ? AND userId IS NOT NULL
      AND userId IN (
        SELECT DISTINCT userId FROM activities 
        WHERE venueId = ? AND date < ? AND userId IS NOT NULL
      )
    `).get(venueId, startDateStr, venueId, startDateStr)
    
    // New clients
    const newClients = db.prepare(`
      SELECT COUNT(DISTINCT userId) as count 
      FROM activities 
      WHERE venueId = ? AND date >= ? AND userId IS NOT NULL
      AND userId NOT IN (
        SELECT DISTINCT userId FROM activities 
        WHERE venueId = ? AND date < ? AND userId IS NOT NULL
      )
    `).get(venueId, startDateStr, venueId, startDateStr)
    
    // Top 5 active clients
    const topClients = db.prepare(`
      SELECT userId, COUNT(*) as visitCount, COALESCE(SUM(points), 0) as totalPoints
      FROM activities 
      WHERE venueId = ? AND type = 'points_earned' AND date >= ? AND userId IS NOT NULL
      GROUP BY userId
      ORDER BY visitCount DESC, totalPoints DESC
      LIMIT 5
    `).all(venueId, startDateStr)
    
    // Unused points balance
    const unusedPoints = db.prepare(`
      SELECT COALESCE(SUM(balance), 0) as total_balance
      FROM (
        SELECT 
          userId,
          COALESCE(SUM(CASE WHEN type = 'points_earned' THEN points ELSE 0 END), 0)
          - COALESCE(SUM(CASE WHEN type = 'purchase' THEN points ELSE 0 END), 0)
          - COALESCE(SUM(CASE WHEN type = 'expired' THEN points ELSE 0 END), 0) as balance
        FROM activities
        WHERE venueId = ? AND userId IS NOT NULL
        GROUP BY userId
      )
    `).get(venueId)
    
    // Average time between visits (simplified query)
    let avgTimeBetweenVisits = { avg_days: null }
    try {
      const visitDates = db.prepare(`
        SELECT userId, date
        FROM activities
        WHERE venueId = ? AND type = 'points_earned' AND date >= ? AND userId IS NOT NULL
        ORDER BY userId, date
      `).all(venueId, startDateStr)
      
      if (visitDates.length > 1) {
        let totalDays = 0
        let count = 0
        let prevUserId = null
        let prevDate = null
        
        for (const visit of visitDates) {
          if (prevUserId === visit.userId && prevDate) {
            const daysDiff = (new Date(visit.date) - new Date(prevDate)) / (1000 * 60 * 60 * 24)
            totalDays += daysDiff
            count++
          }
          prevUserId = visit.userId
          prevDate = visit.date
        }
        
        if (count > 0) {
          avgTimeBetweenVisits.avg_days = totalDays / count
        }
      }
    } catch (error) {
      console.error('Error calculating avg time between visits:', error)
    }
    
    // Cashier analytics
    const cashierStats = db.prepare(`
      SELECT 
        cashierId,
        COUNT(*) as operationCount,
        COUNT(DISTINCT userId) as uniqueClients
      FROM activities
      WHERE venueId = ? AND date >= ? AND cashierId IS NOT NULL
      GROUP BY cashierId
    `).all(venueId, startDateStr)
    
    // Peak hours
    const peakHours = db.prepare(`
      SELECT 
        CAST(strftime('%H', date) AS INTEGER) as hour,
        COUNT(*) as count
      FROM activities
      WHERE venueId = ? AND type = 'points_earned' AND date >= ?
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 5
    `).all(venueId, startDateStr)
    
    res.json({
      period,
      uniqueClients: uniqueClients.count,
      visits: visits.count,
      pointsIssued: pointsIssued.total,
      pointsSpent: pointsSpent.total,
      pointsExpired: pointsExpired.total || 0,
      activeClientsRatio: uniqueClients.count > 0 ? (activeClients.count / uniqueClients.count * 100).toFixed(1) : 0,
      newClients: newClients.count,
      referrals: 0, // TODO: implement referrals
      avgTimeBetweenVisits: avgTimeBetweenVisits && avgTimeBetweenVisits.avg_days ? parseFloat(avgTimeBetweenVisits.avg_days).toFixed(1) : 0,
      topClients: topClients.map(c => ({
        userId: c.userId,
        visits: c.visitCount,
        points: c.totalPoints
      })),
      unusedPointsBalance: unusedPoints.total_balance || 0,
      cashierStats: cashierStats.map(c => ({
        cashierId: c.cashierId,
        operations: c.operationCount,
        uniqueClients: c.uniqueClients
      })),
      peakHours: peakHours.map(h => ({
        hour: h.hour,
        count: h.count
      }))
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

// Get client segmentation (Pro plan)
app.get('/api/venues/:venueId/segmentation', (req, res) => {
  try {
    const venueId = req.params.venueId
    const { inactiveDays = 30 } = req.query
    
    const now = new Date()
    const inactiveThreshold = new Date()
    inactiveThreshold.setDate(now.getDate() - parseInt(inactiveDays))
    
    // New clients (first visit in this venue)
    const newClients = db.prepare(`
      SELECT DISTINCT a.userId
      FROM activities a
      WHERE a.venueId = ? AND a.type = 'points_earned' AND a.userId IS NOT NULL
      AND a.id = (
        SELECT MIN(id) FROM activities 
        WHERE userId = a.userId AND venueId = ? AND type = 'points_earned'
      )
    `).all(venueId, venueId)
    
    // Regular clients (3+ visits)
    const regularClients = db.prepare(`
      SELECT userId, COUNT(*) as visitCount
      FROM activities
      WHERE venueId = ? AND type = 'points_earned' AND userId IS NOT NULL
      GROUP BY userId
      HAVING visitCount >= 3
    `).all(venueId)
    
    // Inactive clients (haven't visited in N days)
    const inactiveClients = db.prepare(`
      SELECT DISTINCT a.userId, MAX(a.date) as lastVisit
      FROM activities a
      WHERE a.venueId = ? AND a.type = 'points_earned' AND a.userId IS NOT NULL
      GROUP BY a.userId
      HAVING lastVisit < ?
    `).all(venueId, inactiveThreshold.toISOString())
    
    // VIP clients (highest balance)
    const vipClients = db.prepare(`
      SELECT 
        a.userId,
        COALESCE(
          (SELECT COALESCE(SUM(points), 0) FROM activities 
           WHERE type = 'points_earned' AND userId = a.userId AND venueId = ?)
          - (SELECT COALESCE(SUM(points), 0) FROM activities 
             WHERE type = 'purchase' AND userId = a.userId AND venueId = ?)
          - (SELECT COALESCE(SUM(points), 0) FROM activities 
             WHERE type = 'expired' AND userId = a.userId AND venueId = ?),
          0
        ) as balance
      FROM activities a
      WHERE a.venueId = ? AND a.userId IS NOT NULL
      GROUP BY a.userId
      ORDER BY balance DESC
      LIMIT 10
    `).all(venueId, venueId, venueId, venueId)
    
    // Potentially churning (inactive but have points)
    const potentiallyChurning = db.prepare(`
      SELECT 
        a.userId,
        MAX(a.date) as lastVisit,
        COALESCE(
          (SELECT COALESCE(SUM(points), 0) FROM activities 
           WHERE type = 'points_earned' AND userId = a.userId AND venueId = ?)
          - (SELECT COALESCE(SUM(points), 0) FROM activities 
             WHERE type = 'purchase' AND userId = a.userId AND venueId = ?)
          - (SELECT COALESCE(SUM(points), 0) FROM activities 
             WHERE type = 'expired' AND userId = a.userId AND venueId = ?),
          0
        ) as balance
      FROM activities a
      WHERE a.venueId = ? AND a.type = 'points_earned' AND a.userId IS NOT NULL
      GROUP BY a.userId
      HAVING lastVisit < ? AND balance > 0
      ORDER BY lastVisit ASC
    `).all(venueId, venueId, venueId, venueId, inactiveThreshold.toISOString())
    
    // Referrals (placeholder - would need referrerId field)
    const referrals = db.prepare(`
      SELECT COUNT(DISTINCT userId) as count
      FROM activities
      WHERE venueId = ? AND type = 'referral' AND userId IS NOT NULL
    `).get(venueId)
    
    res.json({
      newClients: newClients.map(c => ({
        userId: c.userId
      })),
      regularClients: regularClients.map(c => ({
        userId: c.userId,
        visits: c.visitCount
      })),
      inactiveClients: inactiveClients.map(c => ({
        userId: c.userId,
        lastVisit: c.lastVisit
      })),
      vipClients: vipClients.map(c => ({
        userId: c.userId,
        balance: c.balance
      })),
      potentiallyChurning: potentiallyChurning.map(c => ({
        userId: c.userId,
        lastVisit: c.lastVisit,
        balance: c.balance
      })),
      referrals: referrals.count || 0
    })
  } catch (error) {
    console.error('Error fetching segmentation:', error)
    res.status(500).json({ error: 'Failed to fetch segmentation' })
  }
})

// Get ROI analytics (Pro plan)
app.get('/api/venues/:venueId/roi', (req, res) => {
  try {
    const venueId = req.params.venueId
    const { period = 'month' } = req.query
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }
    
    const startDateStr = startDate.toISOString()
    
    // Get venue points per visit (cost of points)
    const venue = db.prepare('SELECT pointsPerVisit FROM venues WHERE id = ?').get(venueId)
    const pointsPerVisit = venue?.pointsPerVisit || 10
    
    // Assume 1 point = 0.01 currency unit (1 ruble, dollar, etc.)
    const pointValue = 0.01
    
    // Points issued (cost to business)
    const pointsIssued = db.prepare(`
      SELECT COALESCE(SUM(points), 0) as total 
      FROM activities 
      WHERE venueId = ? AND type = 'points_earned' AND date >= ?
    `).get(venueId, startDateStr)
    
    // Points spent (revenue from redemptions)
    const pointsSpent = db.prepare(`
      SELECT COALESCE(SUM(points), 0) as total 
      FROM activities 
      WHERE venueId = ? AND type = 'purchase' AND date >= ?
    `).get(venueId, startDateStr)
    
    // Number of visits
    const visits = db.prepare(`
      SELECT COUNT(*) as count 
      FROM activities 
      WHERE venueId = ? AND type = 'points_earned' AND date >= ?
    `).get(venueId, startDateStr)
    
    // Number of purchases (redemptions)
    const purchases = db.prepare(`
      SELECT COUNT(*) as count 
      FROM activities 
      WHERE venueId = ? AND type = 'purchase' AND date >= ?
    `).get(venueId, startDateStr)
    
    // Calculate costs and revenue
    const pointsIssuedCost = pointsIssued.total * pointValue
    const pointsSpentRevenue = pointsSpent.total * pointValue
    
    // Assume average purchase value (can be calculated from menu items)
    const avgPurchaseValue = db.prepare(`
      SELECT AVG(price) as avgPrice
      FROM menu_items
      WHERE venueId = ?
    `).get(venueId)
    
    const estimatedRevenue = (purchases.count * (avgPurchaseValue?.avgPrice || 0)) + pointsSpentRevenue
    
    // ROI calculation
    const netProfit = estimatedRevenue - pointsIssuedCost
    const roi = pointsIssuedCost > 0 ? ((netProfit / pointsIssuedCost) * 100) : 0
    
    // Customer lifetime value (simplified)
    const avgVisitsPerClient = db.prepare(`
      SELECT AVG(visitCount) as avgVisits
      FROM (
        SELECT userId, COUNT(*) as visitCount
        FROM activities
        WHERE venueId = ? AND type = 'points_earned' AND date >= ? AND userId IS NOT NULL
        GROUP BY userId
      )
    `).get(venueId, startDateStr)
    
    const clv = (avgVisitsPerClient?.avgVisits || 0) * (avgPurchaseValue?.avgPrice || 0)
    
    res.json({
      period,
      pointsIssued: pointsIssued.total,
      pointsIssuedCost: pointsIssuedCost.toFixed(2),
      pointsSpent: pointsSpent.total,
      pointsSpentRevenue: pointsSpentRevenue.toFixed(2),
      visits: visits.count,
      purchases: purchases.count,
      estimatedRevenue: estimatedRevenue.toFixed(2),
      netProfit: netProfit.toFixed(2),
      roi: roi.toFixed(2),
      clv: clv.toFixed(2),
      avgPurchaseValue: (avgPurchaseValue?.avgPrice || 0).toFixed(2),
      avgVisitsPerClient: (avgVisitsPerClient?.avgVisits || 0).toFixed(2)
    })
  } catch (error) {
    console.error('Error fetching ROI:', error)
    res.status(500).json({ error: 'Failed to fetch ROI' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
// Start server
app.listen(PORT, () => {
  console.log(`Loyverse Backend running on http://localhost:${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api`)
  
  // Run points expiration check every hour
  setInterval(() => {
    expireAllPoints()
  }, 60 * 60 * 1000) // 1 hour
  
  // Run initial check
  expireAllPoints()
})
