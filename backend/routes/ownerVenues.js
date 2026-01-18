import { isHappyHour } from '../services/happyHours.js'

function registerOwnerVenuesRoutes(app, { db }) {
  app.get('/api/owners/:ownerId/venues', async (req, res) => {
    try {
      const rows = await db.query(`
        SELECT v.* FROM venues v
        JOIN owner_venues ov ON v.id = ov."venueId"
        WHERE ov."ownerId" = $1
      `, [req.params.ownerId])

      const result = []
      for (const venue of rows.rows) {
        const venueData = { ...venue }
        if (venueData.happyHoursSchedule) {
          try {
            venueData.happyHoursSchedule = typeof venueData.happyHoursSchedule === 'string'
              ? JSON.parse(venueData.happyHoursSchedule)
              : venueData.happyHoursSchedule
          } catch (e) {
            venueData.happyHoursSchedule = null
          }
        }
        venueData.isHappyHour = isHappyHour(venueData)
        const menu = await db.query('SELECT * FROM menu_items WHERE "venueId" = $1', [venue.id])
        venueData.menu = menu.rows
        result.push(venueData)
      }

      res.json(result)
    } catch (error) {
      console.error('Error fetching owner venues:', error)
      res.status(500).json({ error: 'Failed to fetch owner venues' })
    }
  })

  app.post('/api/owners/:ownerId/venues/:venueId', async (req, res) => {
    try {
      await db.query(
        'INSERT INTO owner_venues ("ownerId", "venueId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.params.ownerId, req.params.venueId]
      )
      res.json({ success: true })
    } catch (error) {
      console.error('Error adding owner venue:', error)
      res.status(500).json({ error: 'Failed to add venue to owner' })
    }
  })
}

export { registerOwnerVenuesRoutes }
