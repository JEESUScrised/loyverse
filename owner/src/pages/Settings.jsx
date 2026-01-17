import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/api.js'
import './Settings.css'

function Settings({ venueId, onVenueUpdated }) {
  const navigate = useNavigate()
  const [venue, setVenue] = useState(null)
  const [cashiers, setCashiers] = useState([])
  const [showAddCashier, setShowAddCashier] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newCashier, setNewCashier] = useState({
    id: '',
    password: ''
  })

  useEffect(() => {
    loadData()
  }, [venueId])

  const loadData = async () => {
    try {
      const venueData = await api.getVenue(venueId)
      setVenue(venueData)
      
      const cashiersData = await api.getCashiers(venueId)
      setCashiers(cashiersData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleAddVenue = () => {
    localStorage.setItem('creating_new_venue', 'true')
    localStorage.removeItem('owner_current_venue_id')
    localStorage.removeItem('owner_venue_id')
    navigate('/register')
  }

  const handleEditVenue = () => {
    localStorage.setItem('owner_current_venue_id', venueId.toString())
    localStorage.removeItem('creating_new_venue')
    navigate('/register')
  }

  const handleAddCashier = async (e) => {
    e.preventDefault()
    
    if (!newCashier.id.trim() || !newCashier.password.trim()) {
      alert('Заполните ID и пароль кассира')
      return
    }

    setLoading(true)
    try {
      await api.createCashier({
        id: newCashier.id,
        password: newCashier.password,
        venueId: parseInt(venueId, 10),
        venueName: venue?.name || 'Заведение'
      })

      const cashiersData = await api.getCashiers(venueId)
      setCashiers(cashiersData)
      setNewCashier({ id: '', password: '' })
      setShowAddCashier(false)
    } catch (error) {
      console.error('Error adding cashier:', error)
      if (error.message.includes('already exists')) {
        if (error.message.includes('another venue')) {
          alert('Кассир с таким ID уже существует в другом заведении')
        } else {
          alert('Кассир с таким ID уже существует. Пароль обновлен.')
          // Refresh cashiers list even on update
          const cashiersData = await api.getCashiers(venueId)
          setCashiers(cashiersData)
          setNewCashier({ id: '', password: '' })
          setShowAddCashier(false)
        }
      } else {
        alert('Ошибка создания кассира: ' + (error.message || 'Неизвестная ошибка'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCashier = async (cashierId) => {
    if (confirm('Удалить этого кассира?')) {
      try {
        await api.deleteCashier(cashierId)
        const cashiersData = await api.getCashiers(venueId)
        setCashiers(cashiersData)
      } catch (error) {
        console.error('Error removing cashier:', error)
        alert('Ошибка удаления кассира')
      }
    }
  }

  return (
    <div className="settings">
      <div className="settings-header">
        <h1 className="settings-title">Настройки</h1>
      </div>

      <div className="settings-content">
        {/* Кнопка добавления нового заведения */}
        <button className="settings-button" onClick={handleAddVenue}>
          <div className="settings-button-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <div className="settings-button-content">
            <h3 className="settings-button-title">Добавить заведение</h3>
            <p className="settings-button-description">Создать новое заведение</p>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        {/* Кнопка настройки заведения */}
        {venue && (
          <button className="settings-button" onClick={handleEditVenue}>
            <div className="settings-button-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <div className="settings-button-content">
              <h3 className="settings-button-title">Настроить заведение</h3>
              <p className="settings-button-description">Изменить название, адрес, меню и политику баллов</p>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        )}

        {/* Кнопка добавления кассиров */}
        {venue && (
          <div className="settings-section">
            <h2 className="settings-section-title">Кассиры</h2>
          
          <button 
            className="settings-add-cashier-button"
            onClick={() => setShowAddCashier(!showAddCashier)}
          >
            {showAddCashier ? 'Отмена' : '+ Добавить кассира'}
          </button>

          {showAddCashier && (
            <form className="add-cashier-form" onSubmit={handleAddCashier}>
              <div className="form-group">
                <label htmlFor="cashierId">ID кассира *</label>
                <input
                  id="cashierId"
                  type="text"
                  value={newCashier.id}
                  onChange={(e) => setNewCashier(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="Например: cashier1"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cashierPassword">Пароль *</label>
                <input
                  id="cashierPassword"
                  type="password"
                  value={newCashier.password}
                  onChange={(e) => setNewCashier(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Введите пароль"
                  className="form-input"
                  required
                />
              </div>
              <button type="submit" className="submit-cashier-button" disabled={loading}>
                {loading ? 'Создание...' : 'Создать кассира'}
              </button>
            </form>
          )}

          <div className="cashiers-list">
            {cashiers.length === 0 ? (
              <div className="empty-state">
                <p>Кассиры не добавлены</p>
              </div>
            ) : (
              cashiers.map(cashier => (
                <div key={cashier.id} className="cashier-item">
                  <div className="cashier-info">
                    <div className="cashier-id">ID: {cashier.id}</div>
                    <div className="cashier-date">
                      Создан: {new Date(cashier.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <button
                    className="remove-cashier-button"
                    onClick={() => handleRemoveCashier(cashier.id)}
                  >
                    Удалить
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default Settings
