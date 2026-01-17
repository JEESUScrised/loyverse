import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_CONFIG from '@shared/config.js'
import './Venues.css'

function Venues({ venuePoints = {} }) {
  const navigate = useNavigate()
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('common') // 'common' или 'personal'

  const loadVenues = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_CONFIG.baseURL}/venues`)
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`)
      }
      
      const data = await response.json()
      setVenues(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('[Venues] Ошибка загрузки заведений:', e)
      setError('Не удалось загрузить заведения')
      setVenues([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVenues()
    
    // Периодически обновляем список
    const intervalId = setInterval(loadVenues, 60000) // Каждую минуту
    
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const getVenueIcon = (index) => {
    const icons = [
      <svg key="cafe" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/>
        <line x1="10" y1="1" x2="10" y2="4"/>
        <line x1="14" y1="1" x2="14" y2="4"/>
      </svg>,
      <svg key="restaurant" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
        <path d="M7 2v20"/>
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v0"/>
      </svg>,
      <svg key="coffee" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/>
        <line x1="10" y1="1" x2="10" y2="4"/>
        <line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ]
    return icons[index % icons.length]
  }

  // Разделяем заведения на категории
  const commonVenues = venues.filter(v => v.pointsType === 'common')
  const personalVenues = venues.filter(v => v.pointsType === 'personal')
  
  // Определяем активные заведения в зависимости от выбранной вкладки
  const activeVenues = activeTab === 'common' ? commonVenues : personalVenues

  return (
    <div className="venues">
      <div className="venues-container">
        <div className="venues-header">
          <h1 className="venues-title">Заведения</h1>
          <div className="venues-subtitle">Выберите заведение для получения баллов</div>
        </div>

        {/* Переключатель категорий */}
        <div className="venues-tabs">
          <button
            className={`venue-tab ${activeTab === 'common' ? 'active' : ''}`}
            onClick={() => setActiveTab('common')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Общие</span>
            {commonVenues.length > 0 && (
              <span className="tab-count">{commonVenues.length}</span>
            )}
          </button>
          <button
            className={`venue-tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Личные</span>
            {personalVenues.length > 0 && (
              <span className="tab-count">{personalVenues.length}</span>
            )}
          </button>
        </div>

        {/* Активная категория заведений */}
        <div className="venue-category active">
          <div className="venue-category-header">
            <h2 className="venue-category-title">
              {activeTab === 'common' ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Общие баллы
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Личные баллы
                </>
              )}
            </h2>
            <p className="venue-category-subtitle">
              Здесь вы можете потратить баллы Loyverse
            </p>
          </div>
          <div className="venues-list">
            {loading ? (
              <div className="venues-loading">
                <p>Загрузка заведений...</p>
              </div>
            ) : error ? (
              <div className="venues-error">
                <p>{error}</p>
                <button onClick={loadVenues}>Попробовать снова</button>
              </div>
            ) : activeVenues.length > 0 ? (
              activeVenues.map((venue, index) => (
                <div 
                  key={venue.id} 
                  className={`venue-card ${venue.isHappyHour ? 'happy-hour' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/venues/${venue.id}`)}
                >
                  <div className="venue-icon-wrapper">
                    {venue.photo ? (
                      <img src={venue.photo} alt={venue.name} className="venue-photo-icon" />
                    ) : (
                      getVenueIcon(venue.id - 1)
                    )}
                  </div>
                  <div className="venue-content">
                    <div className="venue-header">
                      <h2 className="venue-name">{venue.name}</h2>
                      {activeTab === 'personal' ? (
                        <div className="venue-points-wrapper">
                          {venue.isHappyHour && (
                            <div className="lightning-bolts">
                              <div className="lightning-bolt lightning-bolt-1">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                              </div>
                              <div className="lightning-bolt lightning-bolt-2">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                              </div>
                              <div className="lightning-bolt lightning-bolt-3">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                              </div>
                            </div>
                          )}
                          <div className="venue-points venue-points-balance">
                            <img src="/Coin.svg" alt="Монетка" className="venue-coin-icon" />
                            <span>{venuePoints[venue.id] || 0}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="venue-points-wrapper">
                          {venue.isHappyHour && (
                            <div className="lightning-bolts">
                              <div className="lightning-bolt lightning-bolt-1">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                              </div>
                              <div className="lightning-bolt lightning-bolt-2">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                              </div>
                              <div className="lightning-bolt lightning-bolt-3">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                              </div>
                            </div>
                          )}
                          <div className="venue-points">
                            <img src="/Coin.svg" alt="Монетка" className="venue-coin-icon" />
                            <span>+{venue.pointsPerVisit || 0}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="venue-address">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {venue.address}
                    </p>
                    <p className="venue-description">{venue.description || `${venue.name} - ${venue.address}`}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="venues-empty">
                <p>В этой категории пока нет заведений</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Venues
