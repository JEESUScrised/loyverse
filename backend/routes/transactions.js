function registerTransactionsRoutes(app, { db }) {
  app.post('/api/transactions/earn', async (req, res) => {
    try {
      const { userId, venueId, points, venueName } = req.body

      const venueResult = await db.query('SELECT * FROM venues WHERE id = $1', [venueId])
      const venue = venueResult.rows[0]
      if (!venue) {
        return res.status(404).json({ error: 'Venue not found' })
      }

      let userResult = await db.query('SELECT * FROM users WHERE id = $1 OR "telegramId" = $1', [userId])
      let user = userResult.rows[0]
      if (!user) {
        await db.query('INSERT INTO users (id, "telegramId", points) VALUES ($1, $2, $3)', [userId, userId, 3000])
        user = { id: userId, points: 3000 }
      }

      if (venue.pointsType === 'personal') {
        const current = await db.query(
          'SELECT points FROM user_venue_points WHERE "userId" = $1 AND "venueId" = $2',
          [userId, venueId]
        )
        const currentPoints = current.rows[0]?.points || 0
        await db.query(`
          INSERT INTO user_venue_points ("userId", "venueId", points)
          VALUES ($1, $2, $3)
          ON CONFLICT ("userId", "venueId")
          DO UPDATE SET points = EXCLUDED.points
        `, [userId, venueId, currentPoints + points])
      } else {
        await db.query(
          'UPDATE users SET points = points + $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 OR "telegramId" = $2',
          [points, userId]
        )
      }

      const { cashierId } = req.body
      const earnedDate = new Date().toISOString()
      await db.query(`
        INSERT INTO activities (type, "userId", "telegramId", "venueId", "venueName", points, "cashierId", "earnedDate")
        VALUES ('points_earned', $1, $2, $3, $4, $5, $6, $7)
      `, [userId, userId, venueId, venueName || venue.name, points, cashierId || null, earnedDate])

      res.json({ success: true, points, type: venue.pointsType })
    } catch (error) {
      console.error('Error earning points:', error)
      res.status(500).json({ error: 'Failed to earn points' })
    }
  })

  app.post('/api/transactions/spend', async (req, res) => {
    try {
      const { userId, venueId, points, menuItemId, menuItemName, pointsType } = req.body

      const userResult = await db.query('SELECT * FROM users WHERE id = $1 OR "telegramId" = $1', [userId])
      const user = userResult.rows[0]
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      if (pointsType === 'personal') {
        const current = await db.query(
          'SELECT points FROM user_venue_points WHERE "userId" = $1 AND "venueId" = $2',
          [userId, venueId]
        )
        const currentPoints = current.rows[0]?.points || 0

        if (currentPoints < points) {
          return res.status(400).json({ error: 'Insufficient points' })
        }

        await db.query(
          'UPDATE user_venue_points SET points = points - $1 WHERE "userId" = $2 AND "venueId" = $3',
          [points, userId, venueId]
        )
      } else {
        if (user.points < points) {
          return res.status(400).json({ error: 'Insufficient points' })
        }

        await db.query(
          'UPDATE users SET points = points - $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 OR "telegramId" = $2',
          [points, userId]
        )
      }

      const venue = await db.query('SELECT name FROM venues WHERE id = $1', [venueId])

      const { cashierId } = req.body
      await db.query(`
        INSERT INTO activities (type, "userId", "telegramId", "venueId", "venueName", points, "menuItemId", "menuItemName", "cashierId")
        VALUES ('purchase', $1, $2, $3, $4, $5, $6, $7, $8)
      `, [userId, userId, venueId, venue.rows[0]?.name, points, menuItemId, menuItemName, cashierId || null])

      res.json({ success: true })
    } catch (error) {
      console.error('Error spending points:', error)
      res.status(500).json({ error: 'Failed to spend points' })
    }
  })
}

export { registerTransactionsRoutes }
