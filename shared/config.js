/**
 * Конфигурация API
 */
export const API_CONFIG = {
  // URL API сервера (можно переопределить через переменную окружения)
  // В production VITE_API_URL будет установлен через переменные окружения Vercel
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:3004/api',
  
  // Таймаут запросов (мс)
  timeout: 10000
}

export default API_CONFIG
