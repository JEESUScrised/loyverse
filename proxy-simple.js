/**
 * Упрощенный прокси-сервер без http-proxy-middleware
 * Для диагностики проблем с проксированием
 */

import express from 'express'
import http from 'http'

const app = express()
const PORT = process.env.PROXY_PORT || 8082

// Логирование
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`)
  next()
})

// Простой прокси для app
app.use('/app', (req, res) => {
  const targetUrl = `http://localhost:3000${req.url}`
  console.log(`[App Proxy] Proxying ${req.method} ${req.url} -> ${targetUrl}`)
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:3000'
    }
  }
  
  const proxyReq = http.request(options, (proxyRes) => {
    console.log(`[App Proxy] Response ${proxyRes.statusCode} for ${req.url}`)
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res)
  })
  
  proxyReq.on('error', (err) => {
    console.error(`[App Proxy Error] ${err.message} for ${req.url}`)
    if (!res.headersSent) {
      res.status(502).send('App server not available')
    }
  })
  
  req.pipe(proxyReq)
})

// Прокси для API
app.use('/api', (req, res) => {
  const targetUrl = `http://localhost:3004${req.url}`
  console.log(`[API Proxy] Proxying ${req.method} ${req.url} -> ${targetUrl}`)
  
  const options = {
    hostname: 'localhost',
    port: 3004,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:3004'
    }
  }
  
  const proxyReq = http.request(options, (proxyRes) => {
    console.log(`[API Proxy] Response ${proxyRes.statusCode} for ${req.url}`)
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res)
  })
  
  proxyReq.on('error', (err) => {
    console.error(`[API Proxy Error] ${err.message} for ${req.url}`)
    if (!res.headersSent) {
      res.status(502).send('Backend server not available')
    }
  })
  
  req.pipe(proxyReq)
})

// Редирект с корня на app
app.get('/', (req, res) => {
  res.redirect('/app')
})

app.listen(PORT, () => {
  console.log(`🚀 Упрощенный прокси-сервер запущен на http://localhost:${PORT}`)
  console.log(`📱 App: http://localhost:${PORT}/app`)
  console.log(`🔌 API: http://localhost:${PORT}/api`)
})
