function registerPointsRoutes(app, { expireAllPoints, expirePointsForVenue }) {
  app.post('/api/points/expire', async (req, res) => {
    try {
      const { venueId } = req.body
      if (venueId) {
        await expirePointsForVenue(venueId)
      } else {
        await expireAllPoints()
      }
      res.json({ success: true })
    } catch (error) {
      console.error('Error expiring points:', error)
      res.status(500).json({ error: 'Failed to expire points' })
    }
  })
}

export { registerPointsRoutes }
