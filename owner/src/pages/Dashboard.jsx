import { useState, useEffect } from 'react'
import api from '@shared/api.js'
import './Dashboard.css'

function Dashboard({ venueId, onVenueChange }) {
  const [venue, setVenue] = useState(null)
  const [allVenues, setAllVenues] = useState([])
  const [currentVenueId, setCurrentVenueId] = useState(venueId)
  const [cashiers, setCashiers] = useState([])
  const [subscriptionDays, setSubscriptionDays] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVenues()
  }, [venueId, currentVenueId])

  const loadVenues = async () => {
    try {
      setLoading(true)
      const ownerId = localStorage.getItem('owner_id') || 'default_owner'
      
      // Try to get owner's venues first, fallback to all venues
      let ownerVenues = []
      try {
        ownerVenues = await api.getOwnerVenues(ownerId)
      } catch {
        ownerVenues = await api.getVenues()
      }
      
      setAllVenues(ownerVenues)
      
      const activeVenueId = currentVenueId || venueId
      
      if (!activeVenueId && ownerVenues.length > 0) {
        const firstVenue = ownerVenues[0]
        setVenue(firstVenue)
        setCurrentVenueId(firstVenue.id)
        localStorage.setItem('owner_current_venue_id', firstVenue.id.toString())
        loadVenueDetails(firstVenue.id)
        return
      }
      
      if (activeVenueId) {
        const found = ownerVenues.find(v => v.id === parseInt(activeVenueId, 10))
        if (found) {
          setVenue(found)
          loadVenueDetails(found.id)
        } else if (ownerVenues.length > 0) {
          const firstVenue = ownerVenues[0]
          setVenue(firstVenue)
          setCurrentVenueId(firstVenue.id)
          localStorage.setItem('owner_current_venue_id', firstVenue.id.toString())
          loadVenueDetails(firstVenue.id)
        }
      }
    } catch (error) {
      console.error('Error loading venues:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadVenueDetails = async (venueIdNum) => {
    try {
      // Load cashiers
      const venueCashiers = await api.getCashiers(venueIdNum)
      setCashiers(venueCashiers)
      
      // Load subscription
      const subscription = await api.getSubscription(venueIdNum)
      if (subscription && subscription.endDate) {
        const endDate = new Date(subscription.endDate)
        const now = new Date()
        const diffTime = endDate - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        setSubscriptionDays(diffDays > 0 ? diffDays : 0)
      } else {
        setSubscriptionDays(30) // Default
      }
    } catch (error) {
      console.error('Error loading venue details:', error)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <img src="/LOGO.png" alt="Loyverse" className="dashboard-logo" />
        </div>
        <div className="dashboard-content">
          <div className="dashboard-loading">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <img src="/LOGO.png" alt="Loyverse" className="dashboard-logo" />
        </div>
        <div className="dashboard-content">
          <div className="dashboard-loading">
            {allVenues.length === 0 ? (
              <p>Создайте первое заведение в настройках</p>
            ) : (
              <p>Заведение не найдено</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const handleVenueSelect = (e) => {
    const selectedId = parseInt(e.target.value, 10)
    setCurrentVenueId(selectedId)
    localStorage.setItem('owner_current_venue_id', selectedId.toString())
    if (onVenueChange) {
      onVenueChange(selectedId)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <img src="/LOGO.png" alt="Loyverse" className="dashboard-logo" />
      </div>

      <div className="dashboard-content">
        {/* Информация о заведении */}
        <div className="dashboard-section">
          <div className="venue-section-header">
            <h2 className="dashboard-section-title">Заведение</h2>
            {allVenues.length > 1 && (
              <select 
                className="venue-selector"
                value={venue?.id || ''}
                onChange={handleVenueSelect}
              >
                {allVenues.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="venue-info">
            {venue.photo && (
              <img src={venue.photo} alt={venue.name} className="venue-photo" />
            )}
            <div className="venue-details">
              <div className="venue-detail-item">
                <span className="venue-detail-label">Название:</span>
                <span className="venue-detail-value">{venue.name}</span>
              </div>
              <div className="venue-detail-item">
                <span className="venue-detail-label">Адрес:</span>
                <span className="venue-detail-value">{venue.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Подписка и Кассиры */}
        <div className="dashboard-section dashboard-section-small">
          <div className="combined-info">
            <div className="combined-info-item">
              <h2 className="dashboard-section-title">Подписка</h2>
              <div className="subscription-info">
                <div className="subscription-days">
                  <span className="subscription-days-value">{subscriptionDays !== null ? subscriptionDays : '—'}</span>
                  <span className="subscription-days-label">дней осталось</span>
                </div>
              </div>
            </div>
            <div className="combined-info-item">
              <h2 className="dashboard-section-title">Кассиры</h2>
              <div className="cashiers-summary">
                <div className="cashiers-count">
                  <span className="cashiers-count-value">{cashiers.length}</span>
                  <span className="cashiers-count-label">активных кассиров</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
