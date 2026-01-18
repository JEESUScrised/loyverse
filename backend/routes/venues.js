import { isHappyHour } from '../services/happyHours.js'

function registerVenuesRoutes(app, { db }) {
  app.get('/api/venues', async (req, res) => {
    try {
      const venues = await db.query('SELECT * FROM venues ORDER BY "createdAt" DESC')
      const menuItemsQuery = 'SELECT * FROM menu_items WHERE "venueId" = $1'

      const result = []
      for (const venue of venues.rows) {
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
        const menu = await db.query(menuItemsQuery, [venue.id])
        venueData.menu = menu.rows
        result.push(venueData)
      }

      res.json(result)
    } catch (error) {
      console.error('Error fetching venues:', error)
      res.status(500).json({ error: 'Failed to fetch venues' })
    }
  })

  app.get('/api/venues/:id', async (req, res) => {
    try {
      const venueResult = await db.query('SELECT * FROM venues WHERE id = $1', [req.params.id])
      const venue = venueResult.rows[0]

      if (!venue) {
        return res.status(404).json({ error: 'Venue not found' })
      }

      const menuItems = await db.query('SELECT * FROM menu_items WHERE "venueId" = $1', [venue.id])

      let happyHoursSchedule = null
      if (venue.happyHoursSchedule) {
        try {
          happyHoursSchedule = typeof venue.happyHoursSchedule === 'string'
            ? JSON.parse(venue.happyHoursSchedule)
            : venue.happyHoursSchedule
        } catch (e) {
          happyHoursSchedule = null
        }
      }

      const isHappyHourNow = isHappyHour(venue)

      res.json({
        ...venue,
        menu: menuItems.rows,
        happyHoursSchedule,
        isHappyHour: isHappyHourNow
      })
    } catch (error) {
      console.error('Error fetching venue:', error)
      res.status(500).json({ error: 'Failed to fetch venue' })
    }
  })

  app.post('/api/venues', async (req, res) => {
    try {
      const { name, address, photo, description, pointsPerVisit, pointsType, pointsExpirationDays, happyHoursSchedule, ownerId, telegramId, menu } = req.body

      const finalOwnerId = telegramId || ownerId

      const result = await db.query(`
        INSERT INTO venues (name, address, photo, description, "pointsPerVisit", "pointsType", "pointsExpirationDays", "happyHoursSchedule", "ownerId")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        name,
        address,
        photo,
        description,
        pointsPerVisit || 10,
        pointsType || 'common',
        pointsExpirationDays || 0,
        happyHoursSchedule ? JSON.stringify(happyHoursSchedule) : null,
        finalOwnerId
      ])

      const venueId = result.rows[0].id

      if (finalOwnerId) {
        await db.query(
          'INSERT INTO owner_venues ("ownerId", "venueId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [finalOwnerId, venueId]
        )
      }

      if (menu && Array.isArray(menu)) {
        const menuStmt = `
          INSERT INTO menu_items ("venueId", name, price, category, image, weight, description, composition)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `

        for (const item of menu) {
          await db.query(menuStmt, [
            venueId,
            item.name,
            item.price,
            item.category || 'Main dishes',
            item.image,
            item.weight || null,
            item.description || null,
            item.composition || null
          ])
        }
      }

      if (ownerId) {
        await db.query(
          'INSERT INTO owner_venues ("ownerId", "venueId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [ownerId, venueId]
        )
      }

      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 30)
      await db.query(`
        INSERT INTO subscriptions ("venueId", "endDate", plan)
        VALUES ($1, $2, $3)
        ON CONFLICT ("venueId")
        DO UPDATE SET "endDate" = EXCLUDED."endDate", plan = EXCLUDED.plan, "updatedAt" = CURRENT_TIMESTAMP
      `, [venueId, endDate.toISOString(), 'start'])

      const venue = await db.query('SELECT * FROM venues WHERE id = $1', [venueId])
      const menuItems = await db.query('SELECT * FROM menu_items WHERE "venueId" = $1', [venueId])

      res.status(201).json({ ...venue.rows[0], menu: menuItems.rows })
    } catch (error) {
      console.error('Error creating venue:', error)
      res.status(500).json({ error: 'Failed to create venue' })
    }
  })

  app.put('/api/venues/:id', async (req, res) => {
    try {
      const { name, address, photo, description, pointsPerVisit, pointsType, pointsExpirationDays, happyHoursSchedule, menu } = req.body
      const venueId = req.params.id

      await db.query(`
        UPDATE venues 
        SET name = $1, address = $2, photo = $3, description = $4,
            "pointsPerVisit" = $5, "pointsType" = $6, "pointsExpirationDays" = $7,
            "happyHoursSchedule" = $8, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $9
      `, [
        name,
        address,
        photo,
        description,
        pointsPerVisit,
        pointsType,
        pointsExpirationDays || 0,
        happyHoursSchedule ? JSON.stringify(happyHoursSchedule) : null,
        venueId
      ])

      if (menu && Array.isArray(menu)) {
        await db.query('DELETE FROM menu_items WHERE "venueId" = $1', [venueId])

        const menuStmt = `
          INSERT INTO menu_items ("venueId", name, price, category, image, weight, description, composition)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `

        for (const item of menu) {
          await db.query(menuStmt, [
            venueId,
            item.name,
            item.price,
            item.category || 'Main dishes',
            item.image,
            item.weight || null,
            item.description || null,
            item.composition || null
          ])
        }
      }

      const venue = await db.query('SELECT * FROM venues WHERE id = $1', [venueId])
      const menuItems = await db.query('SELECT * FROM menu_items WHERE "venueId" = $1', [venueId])

      res.json({ ...venue.rows[0], menu: menuItems.rows })
    } catch (error) {
      console.error('Error updating venue:', error)
      res.status(500).json({ error: 'Failed to update venue' })
    }
  })

  app.delete('/api/venues/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM venues WHERE id = $1', [req.params.id])
      res.json({ success: true })
    } catch (error) {
      console.error('Error deleting venue:', error)
      res.status(500).json({ error: 'Failed to delete venue' })
    }
  })
}

export { registerVenuesRoutes }
