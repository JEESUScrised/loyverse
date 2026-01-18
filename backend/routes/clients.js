import { extractTelegramId, validateInitDataForBot } from '../services/telegram.js'

function registerClientsRoutes(app, { db }) {
  app.post('/api/clients/auth', async (req, res) => {
    try {
      const { initData } = req.body

      if (!initData) {
        return res.status(400).json({ error: 'initData is required' })
      }

      if (!validateInitDataForBot(initData, 'client')) {
        return res.status(401).json({ error: 'Invalid initData' })
      }

      const telegramId = extractTelegramId(initData)
      if (!telegramId) {
        return res.status(400).json({ error: 'Could not extract telegramId from initData' })
      }

      let userResult = await db.query('SELECT * FROM users WHERE "telegramId" = $1', [telegramId])
      let user = userResult.rows[0]

      if (!user) {
        await db.query('INSERT INTO users (id, "telegramId", points) VALUES ($1, $2, $3)', [telegramId, telegramId, 3000])
        userResult = await db.query('SELECT * FROM users WHERE "telegramId" = $1', [telegramId])
        user = userResult.rows[0]
      }

      res.json(user)
    } catch (error) {
      console.error('Error authenticating client:', error)
      res.status(500).json({ error: 'Failed to authenticate client' })
    }
  })
}

export { registerClientsRoutes }
