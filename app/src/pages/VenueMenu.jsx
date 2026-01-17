import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API_CONFIG from '@shared/config.js'
import PurchaseQR from '../components/PurchaseQR'
import ProductCard from '../components/ProductCard'
import Notification from '../components/Notification'
import './VenueMenu.css'

function VenueMenu({ points, venuePoints = {}, onSpendPoints, telegramId }) {
  const navigate = useNavigate()
  const { venueId } = useParams()
  const [showQR, setShowQR] = useState(false)
  const [showProductCard, setShowProductCard] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [notification, setNotification] = useState(null)
  const [venue, setVenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadVenue = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`${API_CONFIG.baseURL}/venues/${venueId}`)
        if (!response.ok) {
          throw new Error(`Ошибка загрузки: ${response.status}`)
        }
        
        const data = await response.json()
        setVenue(data)
      } catch (e) {
        console.error('[VenueMenu] Ошибка загрузки заведения:', e)
        setError('Не удалось загрузить заведение')
        setVenue(null)
      } finally {
        setLoading(false)
      }
    }
    
    loadVenue()
  }, [venueId])

  if (loading) {
    return (
      <div className="venue-menu">
        <div className="venue-menu-container">
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error || !venue) {
    return (
      <div className="venue-menu">
        <div className="venue-menu-container">
          <p>{error || 'Заведение не найдено'}</p>
          <button onClick={() => navigate('/venues')} className="back-button-menu">
            Назад
          </button>
        </div>
      </div>
    )
  }

  // Группируем меню по категориям
  const menuByCategory = (venue.menu || []).reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  const handleItemClick = (item) => {
    // Используем цену напрямую как баллы
    const pointsNeeded = item.price
    
    // Определяем, какие баллы использовать (общие или личные)
    const isPersonalVenue = venue.pointsType === 'personal'
    const currentPoints = isPersonalVenue ? (venuePoints[venue.id] || 0) : points
    
    // Показываем карточку товара
    const selectedItemData = {
      ...item,
      pointsNeeded,
      venueId: venue.id,
      venueName: venue.name,
      pointsType: venue.pointsType
    }
    
    setSelectedItem(selectedItemData)
    setShowProductCard(true)
  }

  const handleBuyClick = () => {
    if (!selectedItem) return
    
    // Определяем, какие баллы использовать (общие или личные)
    const isPersonalVenue = venue.pointsType === 'personal'
    const currentPoints = isPersonalVenue ? (venuePoints[venue.id] || 0) : points
    
    if (currentPoints < selectedItem.pointsNeeded) {
      // Показываем уведомление о недостатке баллов
      setNotification({
        message: `Недостаточно баллов. Нужно: ${selectedItem.pointsNeeded}, у вас: ${currentPoints}`,
        type: 'error'
      })
      
      // Автоматически скрываем уведомление через 3 секунды
      setTimeout(() => {
        setNotification(null)
      }, 3000)
      
      // Также показываем уведомление через Telegram WebApp API
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(
          `Недостаточно баллов.\nНужно: ${selectedItem.pointsNeeded}\nУ вас: ${currentPoints}`
        )
      }
      
      return
    }

    // Закрываем карточку товара и показываем QR-код
    setShowProductCard(false)
    setShowQR(true)
  }

  const generatePurchaseData = () => {
    if (!selectedItem) return null
    
    // Используем telegramId или дефолтный ID для тестирования
    const userId = telegramId || 'default_user'
    
    return {
      userId: userId,
      venueId: selectedItem.venueId,
      menuItemId: selectedItem.id,
      menuItemName: selectedItem.name,
      points: selectedItem.pointsNeeded,
      pointsType: selectedItem.pointsType,
      timestamp: Date.now(),
      token: `${userId}_${selectedItem.venueId}_${selectedItem.id}_${Date.now()}`
    }
  }
  
  // Определяем, какие баллы использовать (общие или личные)
  const isPersonalVenue = venue.pointsType === 'personal'
  const currentPoints = isPersonalVenue ? (venuePoints[venue.id] || 0) : points

  return (
    <div className="venue-menu">
      <div className={`venue-menu-header ${venue.isHappyHour ? 'happy-hour' : ''}`}>
        {venue.isHappyHour && (
          <div className="lightning-bolts-menu">
            <div className="lightning-bolt-menu lightning-bolt-menu-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <div className="lightning-bolt-menu lightning-bolt-menu-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <div className="lightning-bolt-menu lightning-bolt-menu-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
          </div>
        )}
        <button className="venue-menu-back" onClick={() => navigate('/venues')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="venue-menu-title-wrapper">
          <h1 className="venue-menu-title">{venue.name}</h1>
          <p className="venue-menu-address">{venue.address}</p>
        </div>
      </div>

      <div className="venue-menu-content">
        {Object.entries(menuByCategory).map(([category, items]) => (
          <div key={category} className="menu-category">
            <h2 className="menu-category-title">{category}</h2>
            <div className="menu-items">
              {items.map(item => {
                const pointsNeeded = item.price
                const canAfford = currentPoints >= pointsNeeded
                
                return (
                  <div 
                    key={item.id} 
                    className={`menu-item ${!canAfford ? 'menu-item-disabled' : ''}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="menu-item-image-wrapper">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="menu-item-image"
                        loading="lazy"
                      />
                    </div>
                    <div className="menu-item-content">
                      <h3 className="menu-item-name">{item.name}</h3>
                      <div className="menu-item-price-wrapper">
                        <div className="menu-item-points">
                          {pointsNeeded} баллов
                          {!canAfford && <span className="menu-item-insufficient"> • Недостаточно</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {showProductCard && selectedItem && (
        <ProductCard
          item={selectedItem}
          pointsNeeded={selectedItem.pointsNeeded}
          currentPoints={currentPoints}
          onBuy={handleBuyClick}
          onClose={() => {
            setShowProductCard(false)
            setSelectedItem(null)
          }}
        />
      )}

      {showQR && selectedItem && generatePurchaseData() && (
        <PurchaseQR
          purchaseData={generatePurchaseData()}
          itemName={selectedItem.name}
          itemPrice={selectedItem.pointsNeeded}
          onClose={() => {
            setShowQR(false)
            setSelectedItem(null)
          }}
        />
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}

export default VenueMenu
