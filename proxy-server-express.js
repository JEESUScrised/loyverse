/**
 * Прокси-сервер на Express для маршрутизации всех приложений
 * Запуск: node proxy-server-express.js
 */

import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

const app = express()
const PORT = process.env.PROXY_PORT || 8082

// Логирование
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`)
  next()
})

// Обход предупреждения ngrok
app.use((req, res, next) => {
  req.headers['ngrok-skip-browser-warning'] = 'true'
  next()
})

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }
  next()
})

// Тестовый endpoint для проверки работы прокси (перед прокси middleware)
app.get('/test', (req, res) => {
  console.log('[Test] Request received')
  res.json({ message: 'Proxy is working', timestamp: new Date().toISOString() })
})

// Прокси для backend API
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3004',
  changeOrigin: true,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('[API Proxy Error]', err.message)
    if (!res.headersSent) {
      res.status(502).send('Backend server not available')
    }
  }
}))

// Прокси для app (клиентское)
// Vite настроен на base: '/app/', поэтому передаем пути как есть
app.use('/app', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  ws: true, // WebSocket для hot reload
  // Не переписываем путь - передаем как есть, так как Vite настроен на /app/
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('ngrok-skip-browser-warning', 'true')
    console.log(`[App Proxy] ${req.method} ${req.url} -> http://localhost:3000${req.url}`)
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[App Proxy] Response ${proxyRes.statusCode} for ${req.url}`)
    if (proxyRes.statusCode === 404) {
      console.error(`[App Proxy] 404 for ${req.url} - Vite may not be running or path is incorrect`)
    }
  },
  onError: (err, req, res) => {
    console.error(`[App Proxy Error] ${err.message} for ${req.url}`)
    console.error(`[App Proxy Error] Stack: ${err.stack}`)
    if (!res.headersSent) {
      res.status(502).send('App server not available. Make sure app is running on port 3000')
    }
  }
}))

// Прокси для owner
app.use('/owner', createProxyMiddleware({
  target: 'http://localhost:5180',
  changeOrigin: true,
  ws: true,
  // Не переписываем путь, так как owner настроен на /owner/
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('[Owner Proxy Error]', err.message)
    if (!res.headersSent) {
      res.status(502).send('Owner server not available')
    }
  }
}))

// Прокси для cashier
app.use('/cashier', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  ws: true,
  // Не переписываем путь, так как cashier настроен на /cashier/
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('[Cashier Proxy Error]', err.message)
    if (!res.headersSent) {
      res.status(502).send('Cashier server not available')
    }
  }
}))

// Редирект с корня на app
app.get('/', (req, res) => {
  console.log('[Root] Redirecting to /app')
  res.redirect('/app')
})

app.listen(PORT, () => {
  console.log(`🚀 Прокси-сервер запущен на http://localhost:${PORT}`)
  console.log(`📱 App: http://localhost:${PORT}/app`)
  console.log(`👤 Owner: http://localhost:${PORT}/owner`)
  console.log(`💰 Cashier: http://localhost:${PORT}/cashier`)
  console.log(`🔌 API: http://localhost:${PORT}/api`)
  console.log(`\n🌐 Запустите ngrok: ngrok http ${PORT}`)
}).on('error', (err) => {
  console.error('Server error:', err)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
})
