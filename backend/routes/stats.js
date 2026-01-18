function registerStatsRoutes(app, { db }) {
  app.get('/api/venues/:venueId/stats', async (req, res) => {
    try {
      const venueId = req.params.venueId

      const visits = await db.query('SELECT COUNT(*) as count FROM activities WHERE "venueId" = $1 AND type = $2', [venueId, 'points_earned'])
      const pointsIssued = await db.query('SELECT COALESCE(SUM(points), 0) as total FROM activities WHERE "venueId" = $1 AND type = $2', [venueId, 'points_earned'])
      const purchases = await db.query('SELECT COUNT(*) as count FROM activities WHERE "venueId" = $1 AND type = $2', [venueId, 'purchase'])
      const pointsSpent = await db.query('SELECT COALESCE(SUM(points), 0) as total FROM activities WHERE "venueId" = $1 AND type = $2', [venueId, 'purchase'])

      const clientStats = await db.query(`
        SELECT "userId", COUNT(*) as "visitCount"
        FROM activities 
        WHERE "venueId" = $1 AND type = 'points_earned' AND "userId" IS NOT NULL
        GROUP BY "userId"
      `, [venueId])

      const newClients = clientStats.rows.filter(c => Number(c.visitCount) === 1).length
      const returningClients = clientStats.rows.filter(c => Number(c.visitCount) >= 2).length

      res.json({
        totalVisits: Number(visits.rows[0].count) || 0,
        totalPointsIssued: Number(pointsIssued.rows[0].total) || 0,
        totalPurchases: Number(purchases.rows[0].count) || 0,
        totalPointsSpent: Number(pointsSpent.rows[0].total) || 0,
        newClients,
        returningClients
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      res.status(500).json({ error: 'Failed to fetch stats' })
    }
  })
}

export { registerStatsRoutes }
