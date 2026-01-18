import { extractTelegramId, validateInitDataForBot } from '../services/telegram.js'

function registerOwnersRoutes(app, { db }) {
  // Get or create owner by telegramId
  app.post('/api/owners/auth', async (req, res) => {
    try {
      const { initData } = req.body

      if (!initData) {
        return res.status(400).json({ error: 'initData is required' })
      }

      if (!validateInitDataForBot(initData, 'owner')) {
        return res.status(401).json({ error: 'Invalid initData' })
      }

      const telegramId = extractTelegramId(initData)
      if (!telegramId) {
        return res.status(400).json({ error: 'Could not extract telegramId from initData' })
      }

      let ownerResult = await db.query('SELECT * FROM owners WHERE "telegramId" = $1', [telegramId])
      let owner = ownerResult.rows[0]

      if (!owner) {
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 365)

        await db.query(`
          INSERT INTO owners ("telegramId", "subscriptionStatus", "subscriptionEndDate", plan)
          VALUES ($1, 'active', $2, 'pro')
        `, [telegramId, endDate.toISOString()])
        ownerResult = await db.query('SELECT * FROM owners WHERE "telegramId" = $1', [telegramId])
        owner = ownerResult.rows[0]
      }

      const now = new Date().toISOString()
      if (owner.subscriptionEndDate && owner.subscriptionEndDate > now) {
        owner.subscriptionStatus = 'active'
      } else {
        owner.subscriptionStatus = 'inactive'
        await db.query(`
          UPDATE owners 
          SET "subscriptionStatus" = 'inactive', "updatedAt" = CURRENT_TIMESTAMP
          WHERE "telegramId" = $1
        `, [telegramId])
      }

      res.json(owner)
    } catch (error) {
      console.error('Error authenticating owner:', error)
      res.status(500).json({ error: 'Failed to authenticate owner' })
    }
  })

  // Get owner by telegramId
  app.get('/api/owners/:telegramId', async (req, res) => {
    try {
      const ownerResult = await db.query('SELECT * FROM owners WHERE "telegramId" = $1', [req.params.telegramId])
      const owner = ownerResult.rows[0]
      if (!owner) {
        return res.status(404).json({ error: 'Owner not found' })
      }

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
}

export { registerOwnersRoutes }
