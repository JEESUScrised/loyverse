import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import api from '@shared/api.js'
import Home from './pages/Home'
import Venues from './pages/Venues'
import VenueMenu from './pages/VenueMenu'
import QRScanner from './components/QRScanner'
import BottomNavbar from './components/BottomNavbar'
import './App.css'

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [points, setPoints] = useState(3000)
  const [telegramId, setTelegramId] = useState(null)
  const [activities, setActivities] = useState([])
  const [venuePoints, setVenuePoints] = useState({})
  const [prevLocation, setPrevLocation] = useState(location.pathname)
  const [transitionDirection, setTransitionDirection] = useState('forward')

  useEffect(() => {
    initUser()
  }, [])

  const initUser = async () => {
    let userId = null
    
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      
      const user = tg.initDataUnsafe?.user
      if (user?.id) {
        userId = user.id.toString()
      }
    }
    
    if (!userId) {
      userId = 'default_user'
    }
    
    setTelegramId(userId)
    
    try {
      // Get user data from API
      const user = await api.getUser(userId)
      setPoints(user.points || 3000)
      
      // Get user activities
      const userActivities = await api.getActivities({ userId, limit: 20 })
      setActivities(userActivities.map(a => ({
        type: a.type === 'points_earned' ? 'earned' : 'spent',
        points: a.points,
        venue: a.venueName,
        date: a.date
      })))
      
      // Get venue points
      const vPoints = await api.getUserVenuePoints(userId)
      setVenuePoints(vPoints)
    } catch (error) {
      console.error('Error initializing user:', error)
      // Use defaults on error
      setPoints(3000)
      setActivities([{
        type: 'earned',
        points: 3000,
        venue: 'Начальный баланс',
        date: new Date().toISOString()
      }])
    }
  }

  const handleAddPoints = async (amount, venueName = 'Заведение', venueId = null) => {
    if (!telegramId) return
    
    try {
      const result = await api.earnPoints({
        userId: telegramId,
        venueId,
        points: amount,
        venueName
      })
      
      if (result.type === 'common') {
        setPoints(prev => prev + amount)
      } else {
        // Personal points
        setVenuePoints(prev => ({
          ...prev,
          [venueId]: (prev[venueId] || 0) + amount
        }))
      }
      
      setActivities(prev => [{
        type: 'earned',
        points: amount,
        venue: venueName,
        date: new Date().toISOString()
      }, ...prev].slice(0, 20))
    } catch (error) {
      console.error('Error adding points:', error)
    }
  }

  const handleSpendPoints = async (amount, venueName = 'Заведение', venueId = null, menuItemId = null, token = null, targetUserId = null, pointsType = null) => {
    const userId = targetUserId || telegramId
    if (!userId) return false
    
    try {
      await api.spendPoints({
        userId,
        venueId,
        points: amount,
        menuItemId,
        menuItemName: venueName,
        pointsType
      })
      
      if (pointsType === 'personal' && venueId) {
        setVenuePoints(prev => ({
          ...prev,
          [venueId]: (prev[venueId] || 0) - amount
        }))
      } else {
        setPoints(prev => prev - amount)
      }
      
      setActivities(prev => [{
        type: 'spent',
        points: amount,
        venue: venueName,
        date: new Date().toISOString()
      }, ...prev].slice(0, 20))
      
      return true
    } catch (error) {
      console.error('Error spending points:', error)
      return false
    }
  }
  
  const handleAddVenuePoints = async (venueId, amount, venueName = 'Заведение') => {
    if (!telegramId) return
    
    try {
      await api.earnPoints({
        userId: telegramId,
        venueId,
        points: amount,
        venueName
      })
      
      setVenuePoints(prev => ({
        ...prev,
        [venueId]: (prev[venueId] || 0) + amount
      }))
      
      setActivities(prev => [{
        type: 'earned',
        points: amount,
        venue: venueName,
        date: new Date().toISOString()
      }, ...prev].slice(0, 20))
    } catch (error) {
      console.error('Error adding venue points:', error)
    }
  }

  useEffect(() => {
    const prevIndex = prevLocation === '/' ? 0 : prevLocation === '/venues' ? 1 : -1
    const currentIndex = location.pathname === '/' ? 0 : location.pathname === '/venues' ? 1 : -1
    
    if (prevIndex !== -1 && currentIndex !== -1) {
      setTransitionDirection(currentIndex > prevIndex ? 'forward' : 'backward')
    }
    
    setPrevLocation(location.pathname)
  }, [location.pathname])

  return (
    <div className="app">
      <div className="app-content">
        <div className={`page-wrapper page-transition-${transitionDirection}`}>
          <Routes location={location} key={location.pathname}>
            <Route 
              path="/" 
              element={<Home points={points} activities={activities} onScanQR={() => navigate('/scan')} />} 
            />
            <Route 
              path="/venues" 
              element={<Venues venuePoints={venuePoints} />} 
            />
            <Route 
              path="/venues/:venueId" 
              element={<VenueMenu points={points} venuePoints={venuePoints} onSpendPoints={handleSpendPoints} telegramId={telegramId} />} 
            />
            <Route 
              path="/scan" 
              element={
                <QRScanner 
                  onPointsAdded={handleAddPoints}
                  onVenuePointsAdded={handleAddVenuePoints}
                  onPurchaseScanned={handleSpendPoints}
                  telegramId={telegramId}
                  onClose={() => navigate('/')} 
                />
              } 
            />
          </Routes>
        </div>
      </div>
      {location.pathname !== '/scan' && !location.pathname.startsWith('/venues/') && (
        <BottomNavbar currentPath={location.pathname} onNavigate={navigate} />
      )}
    </div>
  )
}

function App() {
  // Для Vercel используем корневой путь, так как приложение деплоится отдельно
  return (
    <Router basename="/">
      <AppContent />
    </Router>
  )
}

export default App
