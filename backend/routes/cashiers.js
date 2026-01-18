import { extractTelegramId, validateInitDataForBot } from '../services/telegram.js'
import { hashPassword, verifyPassword } from '../services/passwords.js'

function registerCashiersRoutes(app, { db }) {
  // Authenticate cashier by telegramId
  app.post('/api/cashiers/auth', async (req, res) => {
    try {
      const { initData } = req.body

      if (!initData) {
        return res.status(400).json({ error: 'initData is required' })
      }

      if (!validateInitDataForBot(initData, 'cashier')) {
        return res.status(401).json({ error: 'Invalid initData' })
      }

      const telegramId = extractTelegramId(initData)
      if (!telegramId) {
        return res.status(400).json({ error: 'Could not extract telegramId from initData' })
      }

      const cashierResult = await db.query('SELECT * FROM cashiers WHERE "telegramId" = $1', [telegramId])
      const cashier = cashierResult.rows[0]

      if (!cashier) {
        return res.status(404).json({ error: 'Cashier not found' })
      }

      const { password, ...cashierData } = cashier
      res.json(cashierData)
    } catch (error) {
      console.error('Error authenticating cashier:', error)
      res.status(500).json({ error: 'Failed to authenticate cashier' })
    }
  })

  // Get cashiers by venue
  app.get('/api/venues/:venueId/cashiers', async (req, res) => {
    try {
      const cashiers = await db.query(
        'SELECT id, "venueId", "venueName", "createdAt" FROM cashiers WHERE "venueId" = $1',
        [req.params.venueId]
      )
      res.json(cashiers.rows)
    } catch (error) {
      console.error('Error fetching cashiers:', error)
      res.status(500).json({ error: 'Failed to fetch cashiers' })
    }
  })

  // Create cashier
  app.post('/api/cashiers', async (req, res) => {
    try {
      const { id, password, telegramId, venueId, venueName } = req.body

      if (!id || !password || !venueId) {
        return res.status(400).json({ error: 'ID, password, and venueId are required' })
      }

      const existing = await db.query('SELECT id, "venueId" FROM cashiers WHERE id = $1', [id])
      if (existing.rows.length > 0) {
        if (existing.rows[0].venueId === venueId) {
          await db.query(`
            UPDATE cashiers 
            SET password = $1, "venueName" = $2, "telegramId" = $3
            WHERE id = $4
          `, [hashPassword(password), venueName, telegramId || null, id])
          return res.json({ id, telegramId, venueId, venueName, updated: true })
        }
        return res.status(400).json({ error: 'Cashier with this ID already exists in another venue' })
      }

      if (telegramId) {
        const existingByTelegram = await db.query('SELECT id FROM cashiers WHERE "telegramId" = $1', [telegramId])
        if (existingByTelegram.rows.length > 0) {
          return res.status(400).json({ error: 'Cashier with this Telegram ID already exists' })
        }
      }

      await db.query(`
        INSERT INTO cashiers (id, password, "telegramId", "venueId", "venueName")
        VALUES ($1, $2, $3, $4, $5)
      `, [id, hashPassword(password), telegramId || null, venueId, venueName])

      res.status(201).json({ id, telegramId, venueId, venueName, createdAt: new Date().toISOString() })
    } catch (error) {
      console.error('Error creating cashier:', error)
      res.status(500).json({ error: 'Failed to create cashier' })
    }
  })

  // Login cashier
  app.post('/api/cashiers/login', async (req, res) => {
    try {
      const { id, password } = req.body

      const cashierResult = await db.query(
        'SELECT id, "venueId", "venueName", password FROM cashiers WHERE id = $1',
        [id]
      )
      const cashier = cashierResult.rows[0]

      if (!cashier) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const { ok, isLegacy } = verifyPassword(password, cashier.password)
      if (!ok) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      if (isLegacy) {
        await db.query('UPDATE cashiers SET password = $1 WHERE id = $2', [hashPassword(password), id])
      }

      const { password: _password, ...cashierData } = cashier
      res.json(cashierData)
    } catch (error) {
      console.error('Error logging in cashier:', error)
      res.status(500).json({ error: 'Failed to login' })
    }
  })

  // Delete cashier
  app.delete('/api/cashiers/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM cashiers WHERE id = $1', [req.params.id])
      res.json({ success: true })
    } catch (error) {
      console.error('Error deleting cashier:', error)
      res.status(500).json({ error: 'Failed to delete cashier' })
    }
  })
}

export { registerCashiersRoutes }
