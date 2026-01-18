import crypto from 'crypto'

const BOT_TOKENS = {
  client: process.env.TELEGRAM_CLIENT_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || 'YOUR_CLIENT_BOT_TOKEN',
  owner: process.env.TELEGRAM_OWNER_BOT_TOKEN || 'YOUR_OWNER_BOT_TOKEN',
  cashier: process.env.TELEGRAM_CASHIER_BOT_TOKEN || 'YOUR_CASHIER_BOT_TOKEN'
}

function validateTelegramInitData(initData, botToken) {
  try {
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    urlParams.delete('hash')

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest()

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    return calculatedHash === hash
  } catch (error) {
    console.error('Error validating Telegram initData:', error)
    return false
  }
}

function validateInitDataForBot(initData, botType) {
  const botToken = BOT_TOKENS[botType]
  if (!botToken || botToken.startsWith('YOUR_')) {
    // In development, skip validation if token not set
    console.warn(`Bot token for ${botType} not configured, skipping validation`)
    return true
  }
  return validateTelegramInitData(initData, botToken)
}

function extractTelegramId(initData) {
  try {
    const urlParams = new URLSearchParams(initData)
    const userStr = urlParams.get('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user.id?.toString()
    }
    return null
  } catch (error) {
    console.error('Error extracting telegramId:', error)
    return null
  }
}

export { extractTelegramId, validateInitDataForBot }
