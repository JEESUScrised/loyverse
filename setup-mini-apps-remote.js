/**
 * Скрипт для настройки Mini Apps после деплоя
 * Можно запустить локально или через Railway CLI
 * 
 * Использование:
 *   node setup-mini-apps-remote.js CLIENT_URL OWNER_URL CASHIER_URL
 * 
 * Или через переменные окружения:
 *   CLIENT_APP_URL=... OWNER_APP_URL=... CASHIER_APP_URL=... node setup-mini-apps-remote.js
 */

// Токены ботов
const BOT_TOKENS = {
  client: process.env.TELEGRAM_CLIENT_BOT_TOKEN || '8272586825:AAHMXoiBZtd0ZpUcjHStJrmFaz7iifKnM-0',
  owner: process.env.TELEGRAM_OWNER_BOT_TOKEN || '7711841902:AAE0A7ICbxJgHxk1mWGF1VWxGU2MBRnzeyk',
  cashier: process.env.TELEGRAM_CASHIER_BOT_TOKEN || '8465358531:AAH6O6ov5QeJ-CZIXVywQIS6cR5f0iDMzp0'
}

// URL приложений из аргументов или переменных окружения
const APP_URLS = {
  client: process.argv[2] || process.env.CLIENT_APP_URL,
  owner: process.argv[3] || process.env.OWNER_APP_URL,
  cashier: process.argv[4] || process.env.CASHIER_APP_URL
}

async function setMenuButton(botToken, appUrl, botName) {
  if (!botToken) {
    console.error(`❌ ${botName}: Токен бота не установлен`)
    return false
  }
  
  if (!appUrl) {
    console.error(`❌ ${botName}: URL приложения не установлен`)
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
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(menuButton)
    })
    
    const result = await response.json()
    
    if (result.ok) {
      console.log(`✅ ${botName}: Mini App настроен успешно`)
      return true
    } else {
      console.error(`❌ ${botName}: Ошибка`)
      console.error(`   ${result.description}`)
      return false
    }
  } catch (error) {
    console.error(`❌ ${botName}: Ошибка запроса`)
    console.error(`   ${error.message}`)
    return false
  }
}

async function setupAllMiniApps() {
  console.log('🚀 Настройка Mini Apps для всех ботов...\n')
  
  if (!APP_URLS.client || !APP_URLS.owner || !APP_URLS.cashier) {
    console.error('❌ Не все URL установлены!')
    console.error('\nИспользование:')
    console.error('  node setup-mini-apps-remote.js CLIENT_URL OWNER_URL CASHIER_URL')
    console.error('\nИли через переменные окружения:')
    console.error('  CLIENT_APP_URL=... OWNER_APP_URL=... CASHIER_APP_URL=... node setup-mini-apps-remote.js')
    process.exit(1)
  }
  
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
  } else {
    console.log('\n⚠️  Некоторые Mini Apps не удалось настроить')
    process.exit(1)
  }
}

setupAllMiniApps().catch(console.error)
