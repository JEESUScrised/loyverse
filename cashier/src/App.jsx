import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import './App.css'

function AppContent() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Проверяем, авторизован ли кассир
    const cashierId = localStorage.getItem('cashier_id')
    if (cashierId) {
      setIsAuthenticated(true)
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }, [navigate])

  const handleLogin = (cashierId) => {
    localStorage.setItem('cashier_id', cashierId)
    setIsAuthenticated(true)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('cashier_id')
    setIsAuthenticated(false)
    navigate('/login')
  }

  return (
    <div className="app">
      <Routes>
        <Route 
          path="/login" 
          element={<Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Login onLogin={handleLogin} />} 
        />
      </Routes>
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
