function registerUsersRoutes(app, { db }) {
  app.get('/api/users/:id', async (req, res) => {
    try {
      let userResult = await db.query('SELECT * FROM users WHERE id = $1 OR "telegramId" = $1', [req.params.id])
      let user = userResult.rows[0]

      if (!user) {
        await db.query('INSERT INTO users (id, "telegramId", points) VALUES ($1, $2, $3)', [req.params.id, req.params.id, 3000])
        userResult = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id])
        user = userResult.rows[0]
      }

      res.json(user)
    } catch (error) {
      console.error('Error fetching user:', error)
      res.status(500).json({ error: 'Failed to fetch user' })
    }
  })

  app.put('/api/users/:id/points', async (req, res) => {
    try {
      const { points } = req.body

      await db.query(
        'UPDATE users SET points = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 OR "telegramId" = $2',
        [points, req.params.id]
      )

      res.json({ success: true, points })
    } catch (error) {
      console.error('Error updating user points:', error)
      res.status(500).json({ error: 'Failed to update points' })
    }
  })

  app.get('/api/users/:id/venue-points', async (req, res) => {
    try {
      const rows = await db.query('SELECT "venueId", points FROM user_venue_points WHERE "userId" = $1', [req.params.id])
      const venuePoints = {}
      rows.rows.forEach(row => {
        venuePoints[row.venueId] = row.points
      })
      res.json(venuePoints)
    } catch (error) {
      console.error('Error fetching user venue points:', error)
      res.status(500).json({ error: 'Failed to fetch venue points' })
    }
  })

  app.put('/api/users/:id/venue-points', async (req, res) => {
    try {
      const venuePoints = req.body

      for (const [venueId, points] of Object.entries(venuePoints)) {
        await db.query(`
          INSERT INTO user_venue_points ("userId", "venueId", points)
          VALUES ($1, $2, $3)
          ON CONFLICT ("userId", "venueId")
          DO UPDATE SET points = EXCLUDED.points
        `, [req.params.id, venueId, points])
      }

      res.json({ success: true })
    } catch (error) {
      console.error('Error updating user venue points:', error)
      res.status(500).json({ error: 'Failed to update venue points' })
    }
  })
}

export { registerUsersRoutes }
