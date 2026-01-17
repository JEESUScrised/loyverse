/**
 * API Client for Loyverse Backend
 */
import API_CONFIG from './config.js'

const BASE_URL = API_CONFIG.baseURL

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

export const api = {
  // ==================== VENUES ====================
  getVenues: () => request('/venues'),
  getVenue: (id) => request(`/venues/${id}`),
  createVenue: (data) => request('/venues', { method: 'POST', body: JSON.stringify(data) }),
  updateVenue: (id, data) => request(`/venues/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVenue: (id) => request(`/venues/${id}`, { method: 'DELETE' }),
  
  // ==================== CASHIERS ====================
  getCashiers: (venueId) => request(`/venues/${venueId}/cashiers`),
  createCashier: (data) => request('/cashiers', { method: 'POST', body: JSON.stringify(data) }),
  loginCashier: (id, password) => request('/cashiers/login', { method: 'POST', body: JSON.stringify({ id, password }) }),
  authenticateCashier: (initData) => request('/cashiers/auth', { method: 'POST', body: JSON.stringify({ initData }) }),
  deleteCashier: (id) => request(`/cashiers/${id}`, { method: 'DELETE' }),
  
  // ==================== USERS ====================
  getUser: (id) => request(`/users/${id}`),
  updateUserPoints: (id, points) => request(`/users/${id}/points`, { method: 'PUT', body: JSON.stringify({ points }) }),
  getUserVenuePoints: (id) => request(`/users/${id}/venue-points`),
  updateUserVenuePoints: (id, venuePoints) => request(`/users/${id}/venue-points`, { method: 'PUT', body: JSON.stringify(venuePoints) }),
  
  // ==================== ACTIVITIES ====================
  getActivities: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/activities${query ? `?${query}` : ''}`)
  },
  addActivity: (data) => request('/activities', { method: 'POST', body: JSON.stringify(data) }),
  
  // ==================== SUBSCRIPTIONS ====================
  getSubscription: (venueId) => request(`/venues/${venueId}/subscription`),
  updateSubscription: (venueId, endDate, plan) => request(`/venues/${venueId}/subscription`, { method: 'PUT', body: JSON.stringify({ endDate, plan }) }),
  
  // ==================== CLIENTS ====================
  authenticateClient: (initData) => request('/clients/auth', { method: 'POST', body: JSON.stringify({ initData }) }),
  
  // ==================== OWNERS ====================
  authenticateOwner: (initData) => request('/owners/auth', { method: 'POST', body: JSON.stringify({ initData }) }),
  getOwner: (telegramId) => request(`/owners/${telegramId}`),
  
  // ==================== OWNER VENUES ====================
  getOwnerVenues: (ownerId) => request(`/owners/${ownerId}/venues`),
  addOwnerVenue: (ownerId, venueId) => request(`/owners/${ownerId}/venues/${venueId}`, { method: 'POST' }),
  
  // ==================== PAYMENTS ====================
  createPayment: (telegramId, plan, amount) => request('/payments/create', { method: 'POST', body: JSON.stringify({ telegramId, plan, amount }) }),
  
  // ==================== TRANSACTIONS ====================
  earnPoints: (data) => request('/transactions/earn', { method: 'POST', body: JSON.stringify(data) }),
  spendPoints: (data) => request('/transactions/spend', { method: 'POST', body: JSON.stringify(data) }),
  
  // ==================== STATS ====================
  getVenueStats: (venueId) => request(`/venues/${venueId}/stats`),
  getAnalytics: (venueId, period = 'month') => request(`/venues/${venueId}/analytics?period=${period}`),
  getSegmentation: (venueId, inactiveDays = 30) => request(`/venues/${venueId}/segmentation?inactiveDays=${inactiveDays}`),
  getROI: (venueId, period = 'month') => request(`/venues/${venueId}/roi?period=${period}`),
  
  // ==================== HEALTH ====================
  healthCheck: () => request('/health')
}

export default api
