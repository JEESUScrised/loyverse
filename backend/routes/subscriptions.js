function registerSubscriptionsRoutes(app, { db }) {
  app.get('/api/venues/:venueId/subscription', async (req, res) => {
    try {
      const subscription = await db.query('SELECT * FROM subscriptions WHERE "venueId" = $1', [req.params.venueId])
      res.json(subscription.rows[0] || null)
    } catch (error) {
      console.error('Error fetching subscription:', error)
      res.status(500).json({ error: 'Failed to fetch subscription' })
    }
  })

  app.put('/api/venues/:venueId/subscription', async (req, res) => {
    try {
      const { endDate, plan } = req.body

      const existing = await db.query('SELECT plan FROM subscriptions WHERE "venueId" = $1', [req.params.venueId])
      const planToUse = plan || existing.rows[0]?.plan || 'start'

      await db.query(`
        INSERT INTO subscriptions ("venueId", "endDate", plan, "updatedAt")
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT ("venueId")
        DO UPDATE SET "endDate" = EXCLUDED."endDate", plan = EXCLUDED.plan, "updatedAt" = CURRENT_TIMESTAMP
      `, [req.params.venueId, endDate, planToUse])

      res.json({ success: true })
    } catch (error) {
      console.error('Error updating subscription:', error)
      res.status(500).json({ error: 'Failed to update subscription' })
    }
  })
}

export { registerSubscriptionsRoutes }
