import { useState } from 'react'
import api from '@shared/api.js'
import './Login.css'

function Login({ onLogin }) {
  const [cashierId, setCashierId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!cashierId.trim() || !password.trim()) {
      setError('Заполните все поля')
      return
    }

    setLoading(true)
    setError('')

    try {
      const cashier = await api.loginCashier(cashierId, password)
      
      localStorage.setItem('cashier_id', cashier.id)
      localStorage.setItem('cashier_venue_id', cashier.venueId.toString())
      onLogin(cashier.id)
    } catch (error) {
      console.error('Login error:', error)
      setError('Неверный ID кассира или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login-container">
        <div className="login-header">
          <img src="/LOGO.png" alt="Loyverse" className="login-logo" />
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-title">Вход для кассира</div>
          
          <div className="login-input-group">
            <label htmlFor="cashierId">ID кассира</label>
            <input
              id="cashierId"
              type="text"
              value={cashierId}
              onChange={(e) => setCashierId(e.target.value)}
              placeholder="Введите ID кассира"
              className="login-input"
            />
          </div>

          <div className="login-input-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="login-input"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
