import { useState, useEffect } from 'react'
import api from '@shared/api.js'
import './VenueRegistration.css'

function VenueRegistration({ onVenueCreated, telegramId }) {
  const savedVenueId = localStorage.getItem('owner_current_venue_id') || localStorage.getItem('owner_venue_id')
  const isEditMode = !!savedVenueId && !localStorage.getItem('creating_new_venue')
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    photo: null,
    photoPreview: null,
    menuItems: [{ id: 1, name: '', price: '', category: 'Основные блюда', image: null, weight: '', description: '', composition: '' }],
    pointsPerVisit: 10,
    pointsType: 'common',
    pointsExpirationDays: 0,
    happyHoursSchedule: {
      1: { start: '18:00', end: '20:00', enabled: false },
      2: { start: '18:00', end: '20:00', enabled: false },
      3: { start: '18:00', end: '20:00', enabled: false },
      4: { start: '18:00', end: '20:00', enabled: false },
      5: { start: '18:00', end: '20:00', enabled: false },
      6: { start: '18:00', end: '20:00', enabled: false },
      7: { start: '18:00', end: '20:00', enabled: false }
    }
  })

  const [stepTransition, setStepTransition] = useState('')

  const totalSteps = 6

  useEffect(() => {
    if (isEditMode && savedVenueId) {
      loadVenue()
    }
  }, [isEditMode, savedVenueId])

  const loadVenue = async () => {
    try {
      const venue = await api.getVenue(savedVenueId)
      if (venue) {
        setFormData({
          name: venue.name || '',
          address: venue.address || '',
          photo: null,
          photoPreview: venue.photo || null,
          menuItems: venue.menu && venue.menu.length > 0 
            ? venue.menu.map((item, index) => ({
                id: item.id || Date.now() + index,
                name: item.name || '',
                price: item.price?.toString() || '',
                category: item.category || 'Основные блюда',
                image: item.image || null,
                weight: item.weight || '',
                description: item.description || '',
                composition: item.composition || ''
              }))
            : [{ id: 1, name: '', price: '', category: 'Основные блюда', image: null, weight: '', description: '', composition: '' }],
          pointsPerVisit: venue.pointsPerVisit || 10,
          pointsType: venue.pointsType || 'common',
          pointsExpirationDays: venue.pointsExpirationDays || 0,
          happyHoursSchedule: venue.happyHoursSchedule 
            ? (typeof venue.happyHoursSchedule === 'string' ? JSON.parse(venue.happyHoursSchedule) : venue.happyHoursSchedule)
            : {
                1: { start: '18:00', end: '20:00', enabled: false },
                2: { start: '18:00', end: '20:00', enabled: false },
                3: { start: '18:00', end: '20:00', enabled: false },
                4: { start: '18:00', end: '20:00', enabled: false },
                5: { start: '18:00', end: '20:00', enabled: false },
                6: { start: '18:00', end: '20:00', enabled: false },
                7: { start: '18:00', end: '20:00', enabled: false }
              }
        })
      }
    } catch (error) {
      console.error('Error loading venue:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: file,
          photoPreview: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMenuItemChange = (index, field, value) => {
    const updatedMenu = [...formData.menuItems]
    updatedMenu[index] = {
      ...updatedMenu[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      menuItems: updatedMenu
    }))
  }

  const handleMenuItemImageChange = (index, e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const updatedMenu = [...formData.menuItems]
        updatedMenu[index] = {
          ...updatedMenu[index],
          image: reader.result
        }
        setFormData(prev => ({
          ...prev,
          menuItems: updatedMenu
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const addMenuItem = () => {
    setFormData(prev => ({
      ...prev,
      menuItems: [
        ...prev.menuItems,
        { id: Date.now(), name: '', price: '', category: 'Основные блюда', image: null, weight: '', description: '', composition: '' }
      ]
    }))
  }

  const removeMenuItem = (index) => {
    setFormData(prev => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index)
    }))
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name.trim() || !formData.address.trim()) {
          alert('Заполните название и адрес заведения')
          return false
        }
        return true
      case 2:
        // Type selection - always valid
        return true
      case 3:
        // Expiration days - always valid (0 means no expiration)
        return true
      case 4:
        // Happy hours - always valid
        return true
      case 5:
        if (!formData.pointsPerVisit || formData.pointsPerVisit < 1) {
          alert('Укажите количество баллов за посещение')
          return false
        }
        return true
      case 6:
        if (formData.menuItems.some(item => !item.name.trim() || !item.price)) {
          alert('Заполните все позиции меню')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setStepTransition('slide-out')
        setTimeout(() => {
          setCurrentStep(currentStep + 1)
          setStepTransition('slide-in')
          setTimeout(() => setStepTransition(''), 300)
        }, 300)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setStepTransition('slide-out-reverse')
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setStepTransition('slide-in-reverse')
        setTimeout(() => setStepTransition(''), 300)
      }, 300)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(5)) {
      return
    }

    setLoading(true)

    try {
      const ownerId = telegramId || localStorage.getItem('owner_telegram_id') || localStorage.getItem('owner_id') || 'default_owner'
      
      const venueData = {
        name: formData.name,
        address: formData.address,
        photo: formData.photoPreview,
        description: `${formData.name} - ${formData.address}`,
        pointsPerVisit: parseInt(formData.pointsPerVisit, 10),
        pointsType: formData.pointsType,
        pointsExpirationDays: parseInt(formData.pointsExpirationDays, 10) || 0,
        happyHoursSchedule: formData.happyHoursSchedule || null,
        telegramId: ownerId,
        ownerId,
        menu: formData.menuItems.map(item => ({
          name: item.name,
          price: parseInt(item.price, 10),
          category: item.category,
          image: item.image || 'https://via.placeholder.com/120x120/6B8DD6/FFFFFF?text=Item',
          weight: item.weight || null,
          description: item.description || null,
          composition: item.composition || null
        }))
      }

      let result
      if (isEditMode && savedVenueId) {
        result = await api.updateVenue(savedVenueId, venueData)
      } else {
        result = await api.createVenue(venueData)
      }

      localStorage.setItem('owner_venue_id', result.id.toString())
      localStorage.setItem('owner_current_venue_id', result.id.toString())
      localStorage.removeItem('creating_new_venue')
      
      onVenueCreated(result)
    } catch (error) {
      console.error('Error saving venue:', error)
      alert('Ошибка сохранения заведения')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="registration-step">
            <h2 className="step-title">Основная информация</h2>
            
            <div className="form-group">
              <label htmlFor="name">Название заведения *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Например: Кафе 'Уютное'"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Адрес *</label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Например: ул. Примерная, 10"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="photo">Фото заведения</label>
              <div className="photo-upload">
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="photo-input"
                />
                {formData.photoPreview && (
                  <img src={formData.photoPreview} alt="Preview" className="photo-preview" />
                )}
                {!formData.photoPreview && (
                  <div className="photo-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>Нажмите для загрузки фото</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="registration-step">
            <h2 className="step-title">Тип баллов</h2>
            
            <div className="form-group">
              <label>Выберите тип баллов для вашего заведения</label>
              <div className="points-type-selector">
                <label className={`points-type-option ${formData.pointsType === 'common' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="pointsType"
                    value="common"
                    checked={formData.pointsType === 'common'}
                    onChange={handleInputChange}
                  />
                  <div className="option-content">
                    <h3>Общие баллы</h3>
                    <p>Баллы можно тратить в любом заведении сети</p>
                  </div>
                </label>
                <label className={`points-type-option ${formData.pointsType === 'personal' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="pointsType"
                    value="personal"
                    checked={formData.pointsType === 'personal'}
                    onChange={handleInputChange}
                  />
                  <div className="option-content">
                    <h3>Личные баллы</h3>
                    <p>Баллы можно тратить только в этом заведении</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="registration-step">
            <h2 className="step-title">Время жизни баллов</h2>
            
            <div className="form-group">
              <label htmlFor="pointsExpirationDays">Срок действия баллов (в днях)</label>
              <input
                id="pointsExpirationDays"
                name="pointsExpirationDays"
                type="number"
                value={formData.pointsExpirationDays}
                onChange={handleInputChange}
                min="0"
                className="form-input"
                placeholder="0 = без ограничений"
              />
              <p className="form-hint">
                {formData.pointsExpirationDays === 0 || !formData.pointsExpirationDays
                  ? 'Баллы не будут сгорать'
                  : `Баллы будут сгорать через ${formData.pointsExpirationDays} ${formData.pointsExpirationDays === 1 ? 'день' : formData.pointsExpirationDays < 5 ? 'дня' : 'дней'} после начисления`
                }
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="registration-step">
            <h2 className="step-title">Счастливые часы</h2>
            
            <div className="form-group">
              <p className="form-hint">Настройте счастливые часы для каждого дня недели. Во время счастливых часов посетители получают в 2 раза больше баллов</p>
            </div>

            {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map((dayName, index) => {
              const dayNum = index + 1
              const daySchedule = formData.happyHoursSchedule[dayNum] || { start: '18:00', end: '20:00', enabled: false }
              
              return (
                <div key={dayNum} className="happy-hour-day-config">
                  <div className="happy-hour-day-header">
                    <label className="happy-hour-day-checkbox">
                      <input
                        type="checkbox"
                        checked={daySchedule.enabled}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            happyHoursSchedule: {
                              ...prev.happyHoursSchedule,
                              [dayNum]: {
                                ...prev.happyHoursSchedule[dayNum],
                                enabled: e.target.checked
                              }
                            }
                          }))
                        }}
                      />
                      <span className="happy-hour-day-name">{dayName}</span>
                    </label>
                  </div>
                  
                  {daySchedule.enabled && (
                    <div className="happy-hour-day-times">
                      <div className="form-group">
                        <label>Время начала</label>
                        <input
                          type="time"
                          value={daySchedule.start}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              happyHoursSchedule: {
                                ...prev.happyHoursSchedule,
                                [dayNum]: {
                                  ...prev.happyHoursSchedule[dayNum],
                                  start: e.target.value
                                }
                              }
                            }))
                          }}
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Время окончания</label>
                        <input
                          type="time"
                          value={daySchedule.end}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              happyHoursSchedule: {
                                ...prev.happyHoursSchedule,
                                [dayNum]: {
                                  ...prev.happyHoursSchedule[dayNum],
                                  end: e.target.value
                                }
                              }
                            }))
                          }}
                          className="form-input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )

      case 5:
        return (
          <div className="registration-step">
            <h2 className="step-title">Баллы за посещение</h2>
            
            <div className="form-group">
              <label htmlFor="pointsPerVisit">Баллов за посещение *</label>
              <input
                id="pointsPerVisit"
                name="pointsPerVisit"
                type="number"
                value={formData.pointsPerVisit}
                onChange={handleInputChange}
                min="1"
                className="form-input"
                required
              />
              <p className="form-hint">Количество баллов, которые получает клиент за одно посещение</p>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="registration-step">
            <h2 className="step-title">Меню</h2>
            
            {formData.menuItems.map((item, index) => (
              <div key={item.id} className="menu-item-form">
                <div className="menu-item-header">
                  <h3>Позиция {index + 1}</h3>
                  {formData.menuItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      className="remove-button"
                    >
                      Удалить
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Название позиции *</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                    placeholder="Например: Капучино"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Цена в баллах *</label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleMenuItemChange(index, 'price', e.target.value)}
                    placeholder="Например: 250"
                    min="1"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Категория</label>
                  <select
                    value={item.category}
                    onChange={(e) => handleMenuItemChange(index, 'category', e.target.value)}
                    className="form-input"
                  >
                    <option>Основные блюда</option>
                    <option>Напитки</option>
                    <option>Десерты</option>
                    <option>Завтраки</option>
                    <option>Салаты</option>
                    <option>Супы</option>
                    <option>Паста</option>
                    <option>Пицца</option>
                    <option>Роллы</option>
                    <option>Сеты</option>
                    <option>Выпечка</option>
                    <option>Кофе</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Вес / Объем</label>
                  <input
                    type="text"
                    value={item.weight}
                    onChange={(e) => handleMenuItemChange(index, 'weight', e.target.value)}
                    placeholder="Например: 200 г, 330 мл"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Описание</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleMenuItemChange(index, 'description', e.target.value)}
                    placeholder="Описание блюда или напитка"
                    className="form-input"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Состав</label>
                  <textarea
                    value={item.composition}
                    onChange={(e) => handleMenuItemChange(index, 'composition', e.target.value)}
                    placeholder="Ингредиенты, разделенные запятыми"
                    className="form-input"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Фото позиции</label>
                  <div className="photo-upload small">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleMenuItemImageChange(index, e)}
                      className="photo-input"
                    />
                    {item.image ? (
                      <img src={item.image} alt="Preview" className="photo-preview small" />
                    ) : (
                      <div className="photo-placeholder small">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addMenuItem}
              className="add-item-button"
            >
              + Добавить позицию
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="venue-registration">
      <div className="venue-registration-container">
        <div className="venue-registration-header">
          <h1 className="venue-registration-title">
            {isEditMode ? 'Настройка заведения' : 'Регистрация заведения'}
          </h1>
          <div className="step-indicator">
            <span>Шаг {currentStep} из {totalSteps}</span>
          </div>
        </div>

        <form className="venue-registration-form" onSubmit={handleSubmit}>
          <div className={`step-wrapper ${stepTransition}`}>
            {renderStep()}
          </div>

          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="nav-button nav-button-back"
                disabled={loading}
              >
                Назад
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="nav-button nav-button-next"
                disabled={loading}
              >
                Далее
              </button>
            ) : (
              <button
                type="submit"
                className="nav-button nav-button-submit"
                disabled={loading}
              >
                {loading ? 'Сохранение...' : (isEditMode ? 'Сохранить' : 'Создать')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default VenueRegistration
