import { v4 as uuidv4 } from 'uuid'

function registerPaymentsRoutes(app, { db }) {
  app.post('/api/payments/create', async (req, res) => {
    try {
      const { telegramId, plan, amount } = req.body

      if (!telegramId || !plan) {
        return res.status(400).json({ error: 'telegramId and plan are required' })
      }

      const subscriptionDays = plan === 'pro' ? 30 : 0
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + subscriptionDays)

      const paymentId = uuidv4()

      const paymentData = {
        id: paymentId,
        telegramId,
        plan,
        amount: amount || (plan === 'pro' ? 990 : 0),
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      res.json({
        paymentId,
        paymentUrl: `https://yookassa.ru/checkout/payments/${paymentId}`,
        amount: paymentData.amount
      })
    } catch (error) {
      console.error('Error creating payment:', error)
      res.status(500).json({ error: 'Failed to create payment' })
    }
  })

  app.post('/api/payments/webhook', async (req, res) => {
    try {
      const { event, object } = req.body

      if (event === 'payment.succeeded' && object.status === 'succeeded') {
        const metadata = object.metadata || {}
        const telegramId = metadata.telegramId
        const plan = metadata.plan || 'pro'

        if (telegramId) {
          const endDate = new Date()
          endDate.setDate(endDate.getDate() + 30)

          await db.query(`
            UPDATE owners 
            SET "subscriptionStatus" = 'active',
                "subscriptionEndDate" = $1,
                plan = $2,
                "updatedAt" = CURRENT_TIMESTAMP
            WHERE "telegramId" = $3
          `, [endDate.toISOString(), plan, telegramId])
        
          const venues = await db.query(`
            SELECT v.id FROM venues v
            JOIN owner_venues ov ON v.id = ov."venueId"
            WHERE ov."ownerId" = $1
          `, [telegramId])
        
          for (const venue of venues.rows) {
            await db.query(`
              INSERT INTO subscriptions ("venueId", "endDate", plan, "updatedAt")
              VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
              ON CONFLICT ("venueId")
              DO UPDATE SET "endDate" = EXCLUDED."endDate", plan = EXCLUDED.plan, "updatedAt" = CURRENT_TIMESTAMP
            `, [venue.id, endDate.toISOString(), plan])
          }
        }
      }

      res.status(200).send('OK')
    } catch (error) {
      console.error('Error processing webhook:', error)
      res.status(500).json({ error: 'Failed to process webhook' })
    }
  })
}

export { registerPaymentsRoutes }
