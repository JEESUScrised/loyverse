function createPointsExpirationService(db) {
  async function expirePointsForVenue(venueId) {
    try {
      const venueResult = await db.query('SELECT * FROM venues WHERE id = $1', [venueId])
      const venue = venueResult.rows[0]
      if (!venue || !venue.pointsExpirationDays || venue.pointsExpirationDays <= 0) {
        return
      }

      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() - venue.pointsExpirationDays)
      const expirationDateStr = expirationDate.toISOString()

      const expiredActivities = await db.query(`
        SELECT a.* FROM activities a
        WHERE a."venueId" = $1 
          AND a.type = 'points_earned' 
          AND a."earnedDate" IS NOT NULL 
          AND a."earnedDate" < $2
          AND NOT EXISTS (
            SELECT 1 FROM activities e
            WHERE e.type = 'expired' 
              AND e."userId" = a."userId"
              AND e."venueId" = a."venueId"
              AND e."date" >= a."earnedDate"
              AND e.points >= a.points
          )
        ORDER BY a."earnedDate" ASC
      `, [venueId, expirationDateStr])

      for (const activity of expiredActivities.rows) {
        if (!activity.userId || !activity.points) continue

        let currentPoints = 0
        if (venue.pointsType === 'personal') {
          const userVenuePoints = await db.query(
            'SELECT points FROM user_venue_points WHERE "userId" = $1 AND "venueId" = $2',
            [activity.userId, venueId]
          )
          currentPoints = userVenuePoints.rows[0]?.points || 0
        } else {
          const user = await db.query(
            'SELECT points FROM users WHERE id = $1 OR "telegramId" = $1',
            [activity.userId]
          )
          currentPoints = user.rows[0]?.points || 0
        }

        const pointsToExpire = Math.min(activity.points, currentPoints)

        if (pointsToExpire > 0) {
          if (venue.pointsType === 'personal') {
            await db.query(
              'UPDATE user_venue_points SET points = points - $1 WHERE "userId" = $2 AND "venueId" = $3',
              [pointsToExpire, activity.userId, venueId]
            )
          } else {
            await db.query(
              'UPDATE users SET points = points - $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 OR "telegramId" = $2',
              [pointsToExpire, activity.userId]
            )
          }

          await db.query(`
            INSERT INTO activities (type, "userId", "telegramId", "venueId", "venueName", points, "date")
            VALUES ('expired', $1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          `, [activity.userId, activity.telegramId, venueId, activity.venueName, pointsToExpire])
        }
      }
    } catch (error) {
      console.error(`Error expiring points for venue ${venueId}:`, error)
    }
  }

  async function expireAllPoints() {
    try {
      const venues = await db.query('SELECT id FROM venues')
      for (const venue of venues.rows) {
        await expirePointsForVenue(venue.id)
      }
    } catch (error) {
      console.error('Error expiring all points:', error)
    }
  }

  return { expireAllPoints, expirePointsForVenue }
}

export { createPointsExpirationService }
