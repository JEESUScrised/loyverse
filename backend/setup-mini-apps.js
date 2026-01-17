/**
 * Скрипт для настройки Mini Apps через Bot API
 * Используется когда нет доступа к BotFather
 */

import 'dotenv/config'

const BOT_TOKENS = {
  client: process.env.TELEGRAM_CLIENT_BOT_TOKEN,
  owner: process.env.TELEGRAM_OWNER_BOT_TOKEN,
  cashier: process.env.TELEGRAM_CASHIER_BOT_TOKEN
}

// URL ваших приложений (измените на свои)
const APP_URLS = {
  client: process.env.CLIENT_APP_URL || 'https://yourdomain.com/app',
  owner: process.env.OWNER_APP_URL || 'https://yourdomain.com/owner',
  cashier: process.env.CASHIER_APP_URL || 'https://yourdomain.com/cashier'
}

async function setMenuButton(botToken, appUrl, botName) {
  if (!botToken) {
    console.error(`❌ ${botName}: Токен бота не установлен`)
    return false
  }
  
  if (!appUrl || appUrl === 'https://yourdomain.com/app' || appUrl === 'https://yourdomain.com/owner' || appUrl === 'https://yourdomain.com/cashier') {
    console.error(`❌ ${botName}: URL приложения не установлен или использует значение по умолчанию`)
    console.error(`   Текущий URL: ${appUrl}`)
    return false
  }
  
  const url = `https://api.telegram.org/bot${botToken}/setChatMenuButton`
  
  const menuButton = {
    menu_button: {
      type: 'web_app',
      text: 'Открыть приложение',
      web_app: {
        url: appUrl
      }
    }
  }
  
  console.log(`\n📤 ${botName}: Отправка запроса...`)
  console.log(`   URL: ${appUrl}`)
  console.log(`   API: ${url.replace(botToken, 'TOKEN_HIDDEN')}`)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(menuButton)
    })
    
    const result = await response.json()
    
    console.log(`   Ответ API:`, JSON.stringify(result, null, 2))
    
    if (result.ok) {
      console.log(`✅ ${botName}: Mini App настроен успешно`)
      console.log(`   URL: ${appUrl}`)
      return true
    } else {
      console.error(`❌ ${botName}: Ошибка настройки`)
      console.error(`   Код ошибки: ${result.error_code}`)
      console.error(`   Описание: ${result.description}`)
      return false
    }
  } catch (error) {
    console.error(`❌ ${botName}: Ошибка запроса`)
    console.error(`   Сообщение: ${error.message}`)
    console.error(`   Стек: ${error.stack}`)
    return false
  }
}

async function setupAllMiniApps() {
  console.log('🚀 Настройка Mini Apps для всех ботов...\n')
  
  console.log('📋 Проверка конфигурации:')
  console.log(`   Клиентский токен: ${BOT_TOKENS.client ? '✅ Установлен' : '❌ Не установлен'}`)
  console.log(`   Клиентский URL: ${APP_URLS.client}`)
  console.log(`   Владелец токен: ${BOT_TOKENS.owner ? '✅ Установлен' : '❌ Не установлен'}`)
  console.log(`   Владелец URL: ${APP_URLS.owner}`)
  console.log(`   Кассир токен: ${BOT_TOKENS.cashier ? '✅ Установлен' : '❌ Не установлен'}`)
  console.log(`   Кассир URL: ${APP_URLS.cashier}`)
  console.log('')
  
  const results = {
    client: await setMenuButton(BOT_TOKENS.client, APP_URLS.client, 'Клиентский бот'),
    owner: await setMenuButton(BOT_TOKENS.owner, APP_URLS.owner, 'Бот владельца'),
    cashier: await setMenuButton(BOT_TOKENS.cashier, APP_URLS.cashier, 'Бот кассира')
  }
  
  console.log('\n📊 Результаты:')
  console.log(`   Клиентский: ${results.client ? '✅' : '❌'}`)
  console.log(`   Владелец: ${results.owner ? '✅' : '❌'}`)
  console.log(`   Кассир: ${results.cashier ? '✅' : '❌'}`)
  
  const allSuccess = Object.values(results).every(r => r)
  
  if (allSuccess) {
    console.log('\n✅ Все Mini Apps настроены успешно!')
    console.log('\n💡 Если в Telegram все еще старый URL:')
    console.log('   1. Закройте и откройте бота заново')
    console.log('   2. Очистите кеш Telegram (если нужно)')
    console.log('   3. Проверьте, что используете правильного бота')
  } else {
    console.log('\n⚠️  Некоторые Mini Apps не удалось настроить')
    console.log('   Проверьте токены и URL в .env файле')
    console.log('   Убедитесь, что URL начинается с https://')
  }
}

// Функция для проверки текущей настройки
async function checkMenuButton(botToken, botName) {
  if (!botToken) return null
  
  const url = `https://api.telegram.org/bot${botToken}/getChatMenuButton`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error(`❌ ${botName}: Ошибка проверки`, error.message)
    return null
  }
}

async function verifySetup() {
  console.log('\n🔍 Проверка текущих настроек...\n')
  
  const checks = {
    client: await checkMenuButton(BOT_TOKENS.client, 'Клиентский бот'),
    owner: await checkMenuButton(BOT_TOKENS.owner, 'Бот владельца'),
    cashier: await checkMenuButton(BOT_TOKENS.cashier, 'Бот кассира')
  }
  
  if (checks.client?.ok && checks.client?.result) {
    console.log('📱 Клиентский бот:')
    console.log(`   Текущий URL: ${checks.client.result.web_app?.url || 'Не настроен'}`)
    console.log(`   Ожидаемый URL: ${APP_URLS.client}`)
    console.log(`   Совпадает: ${checks.client.result.web_app?.url === APP_URLS.client ? '✅' : '❌'}`)
  }
  
  if (checks.owner?.ok && checks.owner?.result) {
    console.log('\n👤 Бот владельца:')
    console.log(`   Текущий URL: ${checks.owner.result.web_app?.url || 'Не настроен'}`)
    console.log(`   Ожидаемый URL: ${APP_URLS.owner}`)
    console.log(`   Совпадает: ${checks.owner.result.web_app?.url === APP_URLS.owner ? '✅' : '❌'}`)
  }
  
  if (checks.cashier?.ok && checks.cashier?.result) {
    console.log('\n💰 Бот кассира:')
    console.log(`   Текущий URL: ${checks.cashier.result.web_app?.url || 'Не настроен'}`)
    console.log(`   Ожидаемый URL: ${APP_URLS.cashier}`)
    console.log(`   Совпадает: ${checks.cashier.result.web_app?.url === APP_URLS.cashier ? '✅' : '❌'}`)
  }
}

// Запуск
setupAllMiniApps()
  .then(() => verifySetup())
  .catch(console.error)
