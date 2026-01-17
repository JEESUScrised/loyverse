/**
 * Простой прокси-сервер для маршрутизации всех приложений через один ngrok туннель
 * Запуск: node proxy-server.js
 */

import http from 'http'
import httpProxy from 'http-proxy'

const proxy = httpProxy.createProxyServer({})
const PORT = 8080

const server = http.createServer((req, res) => {
  // Логирование для отладки
  console.log(`[${req.method}] ${req.url}`)
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Прокси для backend API
  if (req.url.startsWith('/api')) {
    proxy.web(req, res, {
      target: 'http://localhost:3004',
      changeOrigin: true
    }, (err) => {
      if (err) {
        console.error('[API Proxy Error]', err.message)
        res.writeHead(502, { 'Content-Type': 'text/plain' })
        res.end('Backend server not available')
      }
    })
    return
  }

  // Прокси для app (клиентское)
  if (req.url.startsWith('/app')) {
    // Сохраняем оригинальный URL
    const originalUrl = req.url
    // Убираем /app из пути
    const newPath = req.url.replace(/^\/app/, '') || '/'
    
    // Временно изменяем URL для проксирования
    const originalUrlProp = req.url
    req.url = newPath
    
    console.log(`  → Proxying ${originalUrl} to localhost:3000${newPath}`)
    
    proxy.web(req, res, {
      target: 'http://localhost:3000',
      changeOrigin: true
    }, (err) => {
      // Восстанавливаем оригинальный URL
      req.url = originalUrlProp
      if (err) {
        console.error('[App Proxy Error]', err.message)
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/plain' })
          res.end('App server not available. Make sure app is running on port 3000')
        }
      }
    })
    return
  }

  // Прокси для owner
  if (req.url.startsWith('/owner')) {
    const originalUrl = req.url
    const newPath = req.url.replace(/^\/owner/, '') || '/'
    const originalUrlProp = req.url
    req.url = newPath
    
    console.log(`  → Proxying ${originalUrl} to localhost:5180${newPath}`)
    proxy.web(req, res, {
      target: 'http://localhost:5180',
      changeOrigin: true
    }, (err) => {
      req.url = originalUrlProp
      if (err) {
        console.error('[Owner Proxy Error]', err.message)
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/plain' })
          res.end('Owner server not available')
        }
      }
    })
    return
  }

  // Прокси для cashier
  if (req.url.startsWith('/cashier')) {
    const originalUrl = req.url
    const newPath = req.url.replace(/^\/cashier/, '') || '/'
    const originalUrlProp = req.url
    req.url = newPath
    
    console.log(`  → Proxying ${originalUrl} to localhost:3001${newPath}`)
    proxy.web(req, res, {
      target: 'http://localhost:3001',
      changeOrigin: true
    }, (err) => {
      req.url = originalUrlProp
      if (err) {
        console.error('[Cashier Proxy Error]', err.message)
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/plain' })
          res.end('Cashier server not available')
        }
      }
    })
    return
  }

  // Редирект с корня на app
  if (req.url === '/') {
    res.writeHead(302, { Location: '/app' })
    res.end()
    return
  }

  // 404 для остального
  console.log(`  → 404 Not Found`)
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found')
})

server.on('upgrade', (req, socket, head) => {
  // WebSocket support для hot reload
  if (req.url.startsWith('/app')) {
    proxy.ws(req, socket, head, { target: 'http://localhost:3000' })
  } else if (req.url.startsWith('/owner')) {
    proxy.ws(req, socket, head, { target: 'http://localhost:5180' })
  } else if (req.url.startsWith('/cashier')) {
    proxy.ws(req, socket, head, { target: 'http://localhost:3001' })
  }
})

server.listen(PORT, () => {
  console.log(`🚀 Прокси-сервер запущен на http://localhost:${PORT}`)
  console.log(`📱 App: http://localhost:${PORT}/app`)
  console.log(`👤 Owner: http://localhost:${PORT}/owner`)
  console.log(`💰 Cashier: http://localhost:${PORT}/cashier`)
  console.log(`🔌 API: http://localhost:${PORT}/api`)
  console.log(`\n🌐 Запустите ngrok: ngrok http ${PORT}`)
})
