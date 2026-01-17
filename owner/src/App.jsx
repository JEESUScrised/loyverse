import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import api from '@shared/api.js'
import VenueRegistration from './pages/VenueRegistration'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Analytics from './pages/Analytics'
import BottomNavbar from './components/BottomNavbar'
import './App.css'

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [venueId, setVenueId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [transitionDirection, setTransitionDirection] = useState('')
  const [prevPath, setPrevPath] = useState(location.pathname)
  const [telegramId, setTelegramId] = useState(null)
  const [owner, setOwner] = useState(null)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    initOwner()
  }, [])

  const initOwner = async () => {
    try {
      let userId = null
      let initData = null
      
      // Get Telegram WebApp initData
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()
        
        const user = tg.initDataUnsafe?.user
        if (user?.id) {
          userId = user.id.toString()
        }
        
        // Get initData from Telegram
        initData = tg.initData || window.location.search.substring(1)
      }
      
      if (!userId) {
        // Fallback for development
        userId = localStorage.getItem('owner_telegram_id') || 'default_owner'
      } else {
        localStorage.setItem('owner_telegram_id', userId)
      }
      
      setTelegramId(userId)
      
      // Authenticate owner
      if (initData) {
        try {
          const ownerData = await api.authenticateOwner(initData)
          setOwner(ownerData)
          
          // Check access
          if (ownerData.subscriptionStatus !== 'active') {
            setAccessDenied(true)
            setLoading(false)
            return
          }
        } catch (error) {
          console.error('Error authenticating owner:', error)
          // Fallback: try to get owner by telegramId
          try {
            const ownerData = await api.getOwner(userId)
            setOwner(ownerData)
            
            if (ownerData.subscriptionStatus !== 'active') {
              setAccessDenied(true)
              setLoading(false)
              return
            }
          } catch (e) {
            console.error('Error fetching owner:', e)
            setAccessDenied(true)
            setLoading(false)
            return
          }
        }
      } else {
        // Fallback: try to get owner by telegramId
        try {
          const ownerData = await api.getOwner(userId)
          setOwner(ownerData)
          
          if (ownerData.subscriptionStatus !== 'active') {
            setAccessDenied(true)
            setLoading(false)
            return
          }
        } catch (e) {
          console.error('Error fetching owner:', e)
        }
      }
      
      // Continue with venue check
      await checkVenues(userId)
    } catch (error) {
      console.error('Error initializing owner:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (telegramId && owner) {
      checkVenues(telegramId)
    }
  }, [telegramId, owner])

  // Track navigation direction for animations
  useEffect(() => {
    if (location.pathname === prevPath) return
    
    const pathOrder = ['/dashboard', '/analytics', '/settings']
    const currentIndex = pathOrder.indexOf(location.pathname)
    const prevIndex = pathOrder.indexOf(prevPath)
    
    if (currentIndex > prevIndex && currentIndex !== -1 && prevIndex !== -1) {
      setTransitionDirection('slide-left')
    } else if (currentIndex < prevIndex && currentIndex !== -1 && prevIndex !== -1) {
      setTransitionDirection('slide-right')
    } else {
      setTransitionDirection('')
    }
    
    setPrevPath(location.pathname)
  }, [location.pathname, prevPath])

  const checkVenues = async (ownerId) => {
    try {
      const finalOwnerId = ownerId || localStorage.getItem('owner_id') || 'default_owner'
      const currentVenueId = localStorage.getItem('owner_current_venue_id') || localStorage.getItem('owner_venue_id')
      const isCreatingNew = localStorage.getItem('creating_new_venue')
      
      if (isCreatingNew && location.pathname === '/register') {
        setLoading(false)
        return
      }
      
      // Try to get owner's venues
      let ownerVenues = []
      try {
        ownerVenues = await api.getOwnerVenues(finalOwnerId)
      } catch {
        ownerVenues = await api.getVenues()
      }
      
      if (ownerVenues.length > 0 && currentVenueId) {
        setVenueId(currentVenueId)
        if (location.pathname === '/register' && !isCreatingNew) {
          // Edit mode is allowed
        } else if (location.pathname === '/register') {
          navigate('/dashboard')
        }
      } else if (ownerVenues.length === 0) {
        if (location.pathname !== '/register') {
          navigate('/register')
        }
      } else if (ownerVenues.length > 0) {
        const firstVenue = ownerVenues[0]
        setVenueId(firstVenue.id)
        localStorage.setItem('owner_current_venue_id', firstVenue.id.toString())
        if (location.pathname === '/register' && !isCreatingNew) {
          navigate('/dashboard')
        }
      }
    } catch (error) {
      console.error('Error checking venues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVenueCreated = (venueData) => {
    setVenueId(venueData.id)
    localStorage.setItem('owner_venue_id', venueData.id.toString())
    localStorage.setItem('owner_current_venue_id', venueData.id.toString())
    navigate('/dashboard')
  }
  
  const handlePaymentSuccess = async () => {
    // Refresh owner data after payment
    if (telegramId) {
      try {
        const ownerData = await api.getOwner(telegramId)
        setOwner(ownerData)
        if (ownerData.subscriptionStatus === 'active') {
          setAccessDenied(false)
          await checkVenues(telegramId)
        }
      } catch (error) {
        console.error('Error refreshing owner after payment:', error)
      }
    }
  }
  
  const handleVenueChange = (newVenueId) => {
    setVenueId(newVenueId)
  }

  const handleVenueUpdated = () => {
    const savedVenueId = localStorage.getItem('owner_venue_id')
    if (savedVenueId) {
      setVenueId(savedVenueId)
      navigate('/dashboard')
    }
  }

  const handleNavigate = (path) => {
    navigate(path)
  }

  if (loading) {
    return <div className="app"><div className="loading">Загрузка...</div></div>
  }

  if (accessDenied) {
    return (
      <div className="app">
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <h2>Доступ ограничен</h2>
          <p>Для использования приложения необходимо активировать подписку.</p>
          <button 
            onClick={async () => {
              try {
                const payment = await api.createPayment(telegramId, 'pro')
                if (window.Telegram?.WebApp) {
                  window.Telegram.WebApp.openLink(payment.paymentUrl)
                } else {
                  window.open(payment.paymentUrl, '_blank')
                }
              } catch (error) {
                console.error('Error creating payment:', error)
                alert('Ошибка при создании платежа')
              }
            }}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Оплатить подписку
          </button>
        </div>
      </div>
    )
  }

  // Показываем навбар на всех страницах, кроме регистрации, если есть venueId
  const showNavbar = venueId && location.pathname !== '/register'

  return (
    <div className="app">
      <div className={`page-transition-wrapper ${transitionDirection}`} key={location.pathname}>
        <Routes location={location}>
          <Route 
            path="/" 
            element={venueId ? <Dashboard venueId={typeof venueId === 'string' ? parseInt(venueId, 10) : venueId} onVenueChange={handleVenueChange} /> : <VenueRegistration onVenueCreated={handleVenueCreated} />} 
          />
            <Route 
            path="/register" 
            element={<VenueRegistration onVenueCreated={handleVenueCreated} telegramId={telegramId} />} 
          />
          <Route 
            path="/dashboard" 
            element={venueId ? <Dashboard venueId={typeof venueId === 'string' ? parseInt(venueId, 10) : venueId} onVenueChange={handleVenueChange} /> : <VenueRegistration onVenueCreated={handleVenueCreated} />} 
          />
          <Route 
            path="/settings" 
            element={venueId ? <Settings venueId={typeof venueId === 'string' ? parseInt(venueId, 10) : venueId} onVenueUpdated={handleVenueUpdated} /> : <VenueRegistration onVenueCreated={handleVenueCreated} />} 
          />
          <Route 
            path="/analytics" 
            element={venueId ? <Analytics venueId={typeof venueId === 'string' ? parseInt(venueId, 10) : venueId} /> : <VenueRegistration onVenueCreated={handleVenueCreated} />} 
          />
        </Routes>
      </div>
      {showNavbar && (
        <BottomNavbar currentPath={location.pathname} onNavigate={handleNavigate} />
      )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
