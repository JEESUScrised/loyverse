function registerActivitiesRoutes(app, { db }) {
  app.get('/api/activities', async (req, res) => {
    try {
      const { userId, venueId, type, limit = 50 } = req.query

      let sql = 'SELECT * FROM activities WHERE 1=1'
      const params = []
      let paramIndex = 1

      if (userId) {
        sql += ` AND ("userId" = $${paramIndex} OR "telegramId" = $${paramIndex})`
        params.push(userId)
        paramIndex += 1
      }
      if (venueId) {
        sql += ` AND "venueId" = $${paramIndex}`
        params.push(venueId)
        paramIndex += 1
      }
      if (type) {
        sql += ` AND type = $${paramIndex}`
        params.push(type)
        paramIndex += 1
      }

      sql += ` ORDER BY "date" DESC LIMIT $${paramIndex}`
      params.push(parseInt(limit))

      const activities = await db.query(sql, params)
      res.json(activities.rows)
    } catch (error) {
      console.error('Error fetching activities:', error)
      res.status(500).json({ error: 'Failed to fetch activities' })
    }
  })

  app.post('/api/activities', async (req, res) => {
    try {
      const { type, userId, telegramId, venueId, venueName, points, menuItemId, menuItemName, cashierId } = req.body

      const result = await db.query(`
        INSERT INTO activities (type, "userId", "telegramId", "venueId", "venueName", points, "menuItemId", "menuItemName", "cashierId")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [type, userId, telegramId, venueId, venueName, points, menuItemId, menuItemName, cashierId || null])

      res.status(201).json({ id: result.rows[0].id, ...req.body })
    } catch (error) {
      console.error('Error adding activity:', error)
      res.status(500).json({ error: 'Failed to add activity' })
    }
  })
}

export { registerActivitiesRoutes }
