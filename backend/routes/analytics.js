function registerAnalyticsRoutes(app, { db }) {
  app.get('/api/venues/:venueId/analytics', async (req, res) => {
    try {
      const venueId = req.params.venueId
      const { period = 'month' } = req.query

      const now = new Date()
      let startDate = new Date()

      switch (period) {
        case 'day':
          startDate.setDate(now.getDate() - 1)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3)
          break
        default:
          startDate.setMonth(now.getMonth() - 1)
      }

      const startDateStr = startDate.toISOString()

      const uniqueClients = await db.query(`
        SELECT COUNT(DISTINCT "userId") as count 
        FROM activities 
        WHERE "venueId" = $1 AND "date" >= $2 AND "userId" IS NOT NULL
      `, [venueId, startDateStr])

      const visits = await db.query(`
        SELECT COUNT(*) as count 
        FROM activities 
        WHERE "venueId" = $1 AND type = 'points_earned' AND "date" >= $2
      `, [venueId, startDateStr])

      const pointsIssued = await db.query(`
        SELECT COALESCE(SUM(points), 0) as total 
        FROM activities 
        WHERE "venueId" = $1 AND type = 'points_earned' AND "date" >= $2
      `, [venueId, startDateStr])

      const pointsSpent = await db.query(`
        SELECT COALESCE(SUM(points), 0) as total 
        FROM activities 
        WHERE "venueId" = $1 AND type = 'purchase' AND "date" >= $2
      `, [venueId, startDateStr])

      const pointsExpired = await db.query(`
        SELECT COALESCE(SUM(points), 0) as total 
        FROM activities 
        WHERE "venueId" = $1 AND type = 'expired' AND "date" >= $2
      `, [venueId, startDateStr])

      const activeClients = await db.query(`
        SELECT COUNT(DISTINCT "userId") as count 
        FROM activities 
        WHERE "venueId" = $1 AND "date" >= $2 AND "userId" IS NOT NULL
        AND "userId" IN (
          SELECT DISTINCT "userId" FROM activities 
          WHERE "venueId" = $3 AND "date" < $4 AND "userId" IS NOT NULL
        )
      `, [venueId, startDateStr, venueId, startDateStr])

      const newClients = await db.query(`
        SELECT COUNT(DISTINCT "userId") as count 
        FROM activities 
        WHERE "venueId" = $1 AND "date" >= $2 AND "userId" IS NOT NULL
        AND "userId" NOT IN (
          SELECT DISTINCT "userId" FROM activities 
          WHERE "venueId" = $3 AND "date" < $4 AND "userId" IS NOT NULL
        )
      `, [venueId, startDateStr, venueId, startDateStr])

      const topClients = await db.query(`
        SELECT "userId", COUNT(*) as "visitCount", COALESCE(SUM(points), 0) as "totalPoints"
        FROM activities 
        WHERE "venueId" = $1 AND type = 'points_earned' AND "date" >= $2 AND "userId" IS NOT NULL
        GROUP BY "userId"
        ORDER BY "visitCount" DESC, "totalPoints" DESC
        LIMIT 5
      `, [venueId, startDateStr])

      const unusedPoints = await db.query(`
        SELECT COALESCE(SUM(balance), 0) as total_balance
        FROM (
          SELECT 
            "userId",
            COALESCE(SUM(CASE WHEN type = 'points_earned' THEN points ELSE 0 END), 0)
            - COALESCE(SUM(CASE WHEN type = 'purchase' THEN points ELSE 0 END), 0)
            - COALESCE(SUM(CASE WHEN type = 'expired' THEN points ELSE 0 END), 0) as balance
          FROM activities
          WHERE "venueId" = $1 AND "userId" IS NOT NULL
          GROUP BY "userId"
        ) balances
      `, [venueId])

      let avgTimeBetweenVisits = { avg_days: null }
      try {
        const visitDates = await db.query(`
          SELECT "userId", "date"
          FROM activities
          WHERE "venueId" = $1 AND type = 'points_earned' AND "date" >= $2 AND "userId" IS NOT NULL
          ORDER BY "userId", "date"
        `, [venueId, startDateStr])

        if (visitDates.rows.length > 1) {
          let totalDays = 0
          let count = 0
          let prevUserId = null
          let prevDate = null

          for (const visit of visitDates.rows) {
            if (prevUserId === visit.userId && prevDate) {
              const daysDiff = (new Date(visit.date) - new Date(prevDate)) / (1000 * 60 * 60 * 24)
              totalDays += daysDiff
              count++
            }
            prevUserId = visit.userId
            prevDate = visit.date
          }

          if (count > 0) {
            avgTimeBetweenVisits.avg_days = totalDays / count
          }
        }
      } catch (error) {
        console.error('Error calculating avg time between visits:', error)
      }

      const cashierStats = await db.query(`
        SELECT 
          "cashierId",
          COUNT(*) as "operationCount",
          COUNT(DISTINCT "userId") as "uniqueClients"
        FROM activities
        WHERE "venueId" = $1 AND "date" >= $2 AND "cashierId" IS NOT NULL
        GROUP BY "cashierId"
      `, [venueId, startDateStr])

      const peakHours = await db.query(`
        SELECT 
          EXTRACT(HOUR FROM "date")::int as hour,
          COUNT(*) as count
        FROM activities
        WHERE "venueId" = $1 AND type = 'points_earned' AND "date" >= $2
        GROUP BY hour
        ORDER BY count DESC
        LIMIT 5
      `, [venueId, startDateStr])

      const uniqueClientCount = Number(uniqueClients.rows[0].count) || 0
      const activeClientCount = Number(activeClients.rows[0].count) || 0

      res.json({
        period,
        uniqueClients: uniqueClientCount,
        visits: Number(visits.rows[0].count) || 0,
        pointsIssued: Number(pointsIssued.rows[0].total) || 0,
        pointsSpent: Number(pointsSpent.rows[0].total) || 0,
        pointsExpired: Number(pointsExpired.rows[0].total) || 0,
        activeClientsRatio: uniqueClientCount > 0 ? (activeClientCount / uniqueClientCount * 100).toFixed(1) : 0,
        newClients: Number(newClients.rows[0].count) || 0,
        referrals: 0,
        avgTimeBetweenVisits: avgTimeBetweenVisits && avgTimeBetweenVisits.avg_days ? parseFloat(avgTimeBetweenVisits.avg_days).toFixed(1) : 0,
        topClients: topClients.rows.map(c => ({
          userId: c.userId,
          visits: Number(c.visitCount),
          points: Number(c.totalPoints)
        })),
        unusedPointsBalance: Number(unusedPoints.rows[0]?.total_balance) || 0,
        cashierStats: cashierStats.rows.map(c => ({
          cashierId: c.cashierId,
          operations: Number(c.operationCount),
          uniqueClients: Number(c.uniqueClients)
        })),
        peakHours: peakHours.rows.map(h => ({
          hour: Number(h.hour),
          count: Number(h.count)
        }))
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      res.status(500).json({ error: 'Failed to fetch analytics' })
    }
  })

  app.get('/api/venues/:venueId/segmentation', async (req, res) => {
    try {
      const venueId = req.params.venueId
      const { inactiveDays = 30 } = req.query

      const now = new Date()
      const inactiveThreshold = new Date()
      inactiveThreshold.setDate(now.getDate() - parseInt(inactiveDays))

      const newClients = await db.query(`
        SELECT DISTINCT a."userId"
        FROM activities a
        WHERE a."venueId" = $1 AND a.type = 'points_earned' AND a."userId" IS NOT NULL
        AND a.id = (
          SELECT MIN(id) FROM activities 
          WHERE "userId" = a."userId" AND "venueId" = $2 AND type = 'points_earned'
        )
      `, [venueId, venueId])

      const regularClients = await db.query(`
        SELECT "userId", COUNT(*) as "visitCount"
        FROM activities
        WHERE "venueId" = $1 AND type = 'points_earned' AND "userId" IS NOT NULL
        GROUP BY "userId"
        HAVING COUNT(*) >= 3
      `, [venueId])

      const inactiveClients = await db.query(`
        SELECT DISTINCT a."userId", MAX(a."date") as "lastVisit"
        FROM activities a
        WHERE a."venueId" = $1 AND a.type = 'points_earned' AND a."userId" IS NOT NULL
        GROUP BY a."userId"
        HAVING MAX(a."date") < $2
      `, [venueId, inactiveThreshold.toISOString()])

      const vipClients = await db.query(`
        SELECT 
          a."userId",
          COALESCE(
            (SELECT COALESCE(SUM(points), 0) FROM activities 
             WHERE type = 'points_earned' AND "userId" = a."userId" AND "venueId" = $1)
            - (SELECT COALESCE(SUM(points), 0) FROM activities 
               WHERE type = 'purchase' AND "userId" = a."userId" AND "venueId" = $2)
            - (SELECT COALESCE(SUM(points), 0) FROM activities 
               WHERE type = 'expired' AND "userId" = a."userId" AND "venueId" = $3),
            0
          ) as balance
        FROM activities a
        WHERE a."venueId" = $4 AND a."userId" IS NOT NULL
        GROUP BY a."userId"
        ORDER BY balance DESC
        LIMIT 10
      `, [venueId, venueId, venueId, venueId])

      const potentiallyChurning = await db.query(`
        SELECT 
          a."userId",
          MAX(a."date") as "lastVisit",
          COALESCE(
            (SELECT COALESCE(SUM(points), 0) FROM activities 
             WHERE type = 'points_earned' AND "userId" = a."userId" AND "venueId" = $1)
            - (SELECT COALESCE(SUM(points), 0) FROM activities 
               WHERE type = 'purchase' AND "userId" = a."userId" AND "venueId" = $2)
            - (SELECT COALESCE(SUM(points), 0) FROM activities 
               WHERE type = 'expired' AND "userId" = a."userId" AND "venueId" = $3),
            0
          ) as balance
        FROM activities a
        WHERE a."venueId" = $4 AND a.type = 'points_earned' AND a."userId" IS NOT NULL
        GROUP BY a."userId"
        HAVING MAX(a."date") < $5 AND (
          COALESCE(
            (SELECT COALESCE(SUM(points), 0) FROM activities 
             WHERE type = 'points_earned' AND "userId" = a."userId" AND "venueId" = $1)
            - (SELECT COALESCE(SUM(points), 0) FROM activities 
               WHERE type = 'purchase' AND "userId" = a."userId" AND "venueId" = $2)
            - (SELECT COALESCE(SUM(points), 0) FROM activities 
               WHERE type = 'expired' AND "userId" = a."userId" AND "venueId" = $3),
            0
          )
        ) > 0
        ORDER BY "lastVisit" ASC
      `, [venueId, venueId, venueId, venueId, inactiveThreshold.toISOString()])

      const referrals = await db.query(`
        SELECT COUNT(DISTINCT "userId") as count
        FROM activities
        WHERE "venueId" = $1 AND type = 'referral' AND "userId" IS NOT NULL
      `, [venueId])

      res.json({
        newClients: newClients.rows.map(c => ({
          userId: c.userId
        })),
        regularClients: regularClients.rows.map(c => ({
          userId: c.userId,
          visits: Number(c.visitCount)
        })),
        inactiveClients: inactiveClients.rows.map(c => ({
          userId: c.userId,
          lastVisit: c.lastVisit
        })),
        vipClients: vipClients.rows.map(c => ({
          userId: c.userId,
          balance: Number(c.balance)
        })),
        potentiallyChurning: potentiallyChurning.rows.map(c => ({
          userId: c.userId,
          lastVisit: c.lastVisit,
          balance: Number(c.balance)
        })),
        referrals: Number(referrals.rows[0].count) || 0
      })
    } catch (error) {
      console.error('Error fetching segmentation:', error)
      res.status(500).json({ error: 'Failed to fetch segmentation' })
    }
  })

  app.get('/api/venues/:venueId/roi', async (req, res) => {
    try {
      const venueId = req.params.venueId
      const { period = 'month' } = req.query

      const now = new Date()
      let startDate = new Date()

      switch (period) {
        case 'day':
          startDate.setDate(now.getDate() - 1)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3)
          break
        default:
          startDate.setMonth(now.getMonth() - 1)
      }

      const startDateStr = startDate.toISOString()

      const venue = await db.query('SELECT "pointsPerVisit" FROM venues WHERE id = $1', [venueId])
      const pointsPerVisit = venue.rows[0]?.pointsPerVisit || 10

      const pointValue = 0.01

      const pointsIssued = await db.query(`
        SELECT COALESCE(SUM(points), 0) as total 
        FROM activities 
        WHERE "venueId" = $1 AND type = 'points_earned' AND "date" >= $2
      `, [venueId, startDateStr])

      const pointsSpent = await db.query(`
        SELECT COALESCE(SUM(points), 0) as total 
        FROM activities 
        WHERE "venueId" = $1 AND type = 'purchase' AND "date" >= $2
      `, [venueId, startDateStr])

      const visits = await db.query(`
        SELECT COUNT(*) as count 
        FROM activities 
        WHERE "venueId" = $1 AND type = 'points_earned' AND "date" >= $2
      `, [venueId, startDateStr])

      const purchases = await db.query(`
        SELECT COUNT(*) as count 
        FROM activities 
        WHERE "venueId" = $1 AND type = 'purchase' AND "date" >= $2
      `, [venueId, startDateStr])

      const pointsIssuedCost = Number(pointsIssued.rows[0].total) * pointValue
      const pointsSpentRevenue = Number(pointsSpent.rows[0].total) * pointValue

      const avgPurchaseValue = await db.query(`
        SELECT AVG(price) as avgPrice
        FROM menu_items
        WHERE "venueId" = $1
      `, [venueId])

      const estimatedRevenue = (Number(purchases.rows[0].count) * (Number(avgPurchaseValue.rows[0]?.avgprice) || 0)) + pointsSpentRevenue

      const netProfit = estimatedRevenue - pointsIssuedCost
      const roi = pointsIssuedCost > 0 ? ((netProfit / pointsIssuedCost) * 100) : 0

      const avgVisitsPerClient = await db.query(`
        SELECT AVG(visitCount) as avgVisits
        FROM (
          SELECT "userId", COUNT(*) as visitCount
          FROM activities
          WHERE "venueId" = $1 AND type = 'points_earned' AND "date" >= $2 AND "userId" IS NOT NULL
          GROUP BY "userId"
        ) sub
      `, [venueId, startDateStr])

      const clv = (Number(avgVisitsPerClient.rows[0]?.avgvisits) || 0) * (Number(avgPurchaseValue.rows[0]?.avgprice) || 0)

      res.json({
        period,
        pointsIssued: Number(pointsIssued.rows[0].total) || 0,
        pointsIssuedCost: pointsIssuedCost.toFixed(2),
        pointsSpent: Number(pointsSpent.rows[0].total) || 0,
        pointsSpentRevenue: pointsSpentRevenue.toFixed(2),
        visits: Number(visits.rows[0].count) || 0,
        purchases: Number(purchases.rows[0].count) || 0,
        estimatedRevenue: estimatedRevenue.toFixed(2),
        netProfit: netProfit.toFixed(2),
        roi: roi.toFixed(2),
        clv: clv.toFixed(2),
        avgPurchaseValue: (Number(avgPurchaseValue.rows[0]?.avgprice) || 0).toFixed(2),
        avgVisitsPerClient: (Number(avgVisitsPerClient.rows[0]?.avgvisits) || 0).toFixed(2)
      })
    } catch (error) {
      console.error('Error fetching ROI:', error)
      res.status(500).json({ error: 'Failed to fetch ROI' })
    }
  })
}

export { registerAnalyticsRoutes }
