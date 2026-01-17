import { useState, useEffect } from 'react'
import api from '@shared/api.js'
import './Analytics.css'

function Analytics({ venueId }) {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [basicStats, setBasicStats] = useState(null)
  const [advancedStats, setAdvancedStats] = useState(null)
  const [segmentation, setSegmentation] = useState(null)
  const [roi, setROI] = useState(null)
  const [error, setError] = useState(null)
  const [showProModal, setShowProModal] = useState(false)

  const isPro = subscription && subscription.plan === 'pro'

  useEffect(() => {
    loadSubscription()
    loadBasicStats()
    if (isPro) {
      loadAdvancedStats()
      loadSegmentation()
      loadROI()
    }
  }, [venueId, period, isPro])

  const loadSubscription = async () => {
    try {
      const sub = await api.getSubscription(venueId)
      setSubscription(sub || { plan: 'start' })
    } catch (error) {
      console.error('Error loading subscription:', error)
      setSubscription({ plan: 'start' })
    }
  }

  const loadBasicStats = async () => {
    try {
      setLoading(true)
      const stats = await api.getVenueStats(venueId)
      setBasicStats(stats)
    } catch (error) {
      console.error('Error loading basic stats:', error)
      setError('Не удалось загрузить статистику')
    } finally {
      setLoading(false)
    }
  }

  const loadAdvancedStats = async () => {
    try {
      const stats = await api.getAnalytics(venueId, period)
      setAdvancedStats(stats)
    } catch (error) {
      console.error('Error loading advanced stats:', error)
    }
  }

  const loadSegmentation = async () => {
    try {
      const data = await api.getSegmentation(venueId, 30)
      setSegmentation(data)
    } catch (error) {
      console.error('Error loading segmentation:', error)
    }
  }

  const loadROI = async () => {
    try {
      const data = await api.getROI(venueId, period)
      setROI(data)
    } catch (error) {
      console.error('Error loading ROI:', error)
    }
  }

  const ProModal = () => {
    if (!showProModal) return null
    
    return (
      <div className="pro-modal-overlay" onClick={() => setShowProModal(false)}>
        <div className="pro-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="pro-modal-close" onClick={() => setShowProModal(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="pro-modal-header">
            <div className="pro-badge-large">PRO</div>
            <h2>Преимущества Pro версии</h2>
            <p>Расширенные возможности для управления вашим бизнесом</p>
          </div>
          <div className="pro-modal-features">
            <div className="pro-feature-item">
              <div className="pro-feature-icon">📈</div>
              <div className="pro-feature-content">
                <h3>Продвинутая аналитика</h3>
                <p>Основные показатели за период, топ клиентов, пиковые часы, аналитика кассиров</p>
              </div>
            </div>
            <div className="pro-feature-item">
              <div className="pro-feature-icon">👥</div>
              <div className="pro-feature-content">
                <h3>Сегментация клиентов</h3>
                <p>Разделение клиентской базы по поведению: новые, постоянные, VIP, неактивные</p>
              </div>
            </div>
            <div className="pro-feature-item">
              <div className="pro-feature-icon">💰</div>
              <div className="pro-feature-content">
                <h3>ROI программы лояльности</h3>
                <p>Расчет эффективности программы в деньгах</p>
              </div>
            </div>
            <div className="pro-feature-item">
              <div className="pro-feature-icon">🎯</div>
              <div className="pro-feature-content">
                <h3>Все Winback механики</h3>
                <p>Автоматические триггеры и напоминания для клиентов</p>
              </div>
            </div>
            <div className="pro-feature-item">
              <div className="pro-feature-icon">🎁</div>
              <div className="pro-feature-content">
                <h3>Квесты и акции</h3>
                <p>Создание специальных предложений и квестов для клиентов</p>
              </div>
            </div>
          </div>
          <button className="pro-modal-upgrade-button" onClick={() => {
            setShowProModal(false)
            // Здесь можно добавить логику перехода на страницу оплаты
            alert('Переход на страницу оплаты Pro тарифа')
          }}>
            Обновить до Pro
          </button>
        </div>
      </div>
    )
  }

  if (loading && !basicStats) {
    return (
      <div className="analytics">
        <div className="analytics-loading">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1 className="analytics-title">Аналитика</h1>
        {subscription && (
          <div className={`plan-badge ${isPro ? 'plan-pro' : 'plan-start'}`}>
            {isPro ? 'PRO' : 'START'}
          </div>
        )}
      </div>

      {/* Базовая аналитика (Start) */}
      <div className="analytics-section">
        <h2 className="section-title">Базовая аналитика</h2>
        {basicStats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{basicStats.totalVisits || 0}</div>
                <div className="stat-label">Посещений</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{basicStats.totalPointsIssued || 0}</div>
                <div className="stat-label">Баллов выдано</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{basicStats.totalPurchases || 0}</div>
                <div className="stat-label">Покупок</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{basicStats.totalPointsSpent || 0}</div>
                <div className="stat-label">Баллов потрачено</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{basicStats.newClients || 0}</div>
                <div className="stat-label">Новых клиентов</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{basicStats.returningClients || 0}</div>
                <div className="stat-label">Вернувшихся</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Продвинутая аналитика (Pro) */}
      {!isPro && (
        <div className="pro-banner" onClick={() => setShowProModal(true)}>
          <div className="pro-banner-content">
            <div className="pro-banner-icon">🔒</div>
            <div className="pro-banner-text">
              <h3>Доступно в Pro версии</h3>
              <p>Нажмите, чтобы узнать о преимуществах</p>
            </div>
            <div className="pro-banner-arrow">→</div>
          </div>
        </div>
      )}
      
      {isPro && (
        <div className="analytics-section">
          <div className="period-selector">
            <button 
              className={period === 'day' ? 'active' : ''} 
              onClick={() => setPeriod('day')}
            >
              День
            </button>
            <button 
              className={period === 'week' ? 'active' : ''} 
              onClick={() => setPeriod('week')}
            >
              Неделя
            </button>
            <button 
              className={period === 'month' ? 'active' : ''} 
              onClick={() => setPeriod('month')}
            >
              Месяц
            </button>
            <button 
              className={period === 'quarter' ? 'active' : ''} 
              onClick={() => setPeriod('quarter')}
            >
              Квартал
            </button>
          </div>

          {advancedStats && (
            <>
              {/* Основные показатели за период */}
              <h3 className="subsection-title">Основные показатели за {period === 'day' ? 'день' : period === 'week' ? 'неделю' : period === 'month' ? 'месяц' : 'квартал'}</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{advancedStats.uniqueClients || 0}</div>
                  <div className="stat-label">Уникальных клиентов</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{advancedStats.visits || 0}</div>
                  <div className="stat-label">Визитов</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{advancedStats.pointsIssued || 0}</div>
                  <div className="stat-label">Выдано баллов</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{advancedStats.pointsSpent || 0}</div>
                  <div className="stat-label">Потрачено баллов</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{advancedStats.activeClientsRatio || 0}%</div>
                  <div className="stat-label">Доля активных клиентов</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{advancedStats.newClients || 0}</div>
                  <div className="stat-label">Новых клиентов</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{advancedStats.avgTimeBetweenVisits || 0}</div>
                  <div className="stat-label">Среднее время между визитами (дней)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{advancedStats.unusedPointsBalance || 0}</div>
                  <div className="stat-label">Баланс неиспользованных баллов</div>
                </div>
              </div>

              {/* Топ-5 активных клиентов */}
              <h3 className="subsection-title">Топ-5 активных клиентов</h3>
              <div className="top-clients">
                {advancedStats.topClients && advancedStats.topClients.length > 0 ? (
                  advancedStats.topClients.map((client, index) => (
                    <div key={client.userId} className="client-card">
                      <div className="client-rank">#{index + 1}</div>
                      <div className="client-info">
                        <div className="client-id">ID: {client.userId.substring(0, 8)}...</div>
                        <div className="client-stats">
                          <span>{client.visits} визитов</span>
                          <span>{client.points} баллов</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">Нет данных</div>
                )}
              </div>

              {/* Аналитика баллов */}
              <h3 className="subsection-title">Аналитика баллов</h3>
              <div className="points-analytics">
                <div className="points-stat">
                  <span className="points-label">🎁 Начислено:</span>
                  <span className="points-value">{advancedStats.pointsIssued || 0}</span>
                </div>
                <div className="points-stat">
                  <span className="points-label">💳 Списано:</span>
                  <span className="points-value">{advancedStats.pointsSpent || 0}</span>
                </div>
                <div className="points-stat">
                  <span className="points-label">🧾 Сгорело:</span>
                  <span className="points-value">{advancedStats.pointsExpired || 0}</span>
                </div>
                <div className="points-stat">
                  <span className="points-label">⏳ Баланс:</span>
                  <span className="points-value">{advancedStats.unusedPointsBalance || 0}</span>
                </div>
              </div>

              {/* Пиковые часы */}
              {advancedStats.peakHours && advancedStats.peakHours.length > 0 && (
                <>
                  <h3 className="subsection-title">🕐 Пиковые часы начисления</h3>
                  <div className="peak-hours">
                    {advancedStats.peakHours.map((hour, index) => (
                      <div key={index} className="peak-hour-item">
                        <span className="hour-time">{hour.hour}:00</span>
                        <div className="hour-bar">
                          <div 
                            className="hour-bar-fill" 
                            style={{ width: `${(hour.count / advancedStats.peakHours[0].count) * 100}%` }}
                          ></div>
                        </div>
                        <span className="hour-count">{hour.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Аналитика кассиров */}
              {advancedStats.cashierStats && advancedStats.cashierStats.length > 0 && (
                <>
                  <h3 className="subsection-title">Аналитика кассиров</h3>
                  <div className="cashier-analytics">
                    {advancedStats.cashierStats.map((cashier, index) => (
                      <div key={cashier.cashierId} className="cashier-stat-card">
                        <div className="cashier-id">Кассир: {cashier.cashierId}</div>
                        <div className="cashier-stats">
                          <span>Операций: {cashier.operations}</span>
                          <span>Клиентов: {cashier.uniqueClients}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Сегментация клиентов (Pro) */}
      {isPro && (
        <div className="analytics-section">
          <h2 className="section-title">Сегментация клиентов</h2>
          {segmentation ? (
            <div className="segmentation-grid">
              <div className="segmentation-card new">
                <div className="segmentation-icon">💚</div>
                <div className="segmentation-content">
                  <h3>Новые клиенты</h3>
                  <div className="segmentation-count">{segmentation.newClients.length}</div>
                </div>
              </div>
              <div className="segmentation-card regular">
                <div className="segmentation-icon">💜</div>
                <div className="segmentation-content">
                  <h3>Постоянные клиенты (3+ визита)</h3>
                  <div className="segmentation-count">{segmentation.regularClients.length}</div>
                </div>
              </div>
              <div className="segmentation-card inactive">
                <div className="segmentation-icon">💤</div>
                <div className="segmentation-content">
                  <h3>Неактивные (не были 30 дней)</h3>
                  <div className="segmentation-count">{segmentation.inactiveClients.length}</div>
                </div>
              </div>
              <div className="segmentation-card vip">
                <div className="segmentation-icon">🔥</div>
                <div className="segmentation-content">
                  <h3>VIP-клиенты (с наибольшим балансом)</h3>
                  <div className="segmentation-count">{segmentation.vipClients.length}</div>
                </div>
              </div>
              <div className="segmentation-card churning">
                <div className="segmentation-icon">🎯</div>
                <div className="segmentation-content">
                  <h3>Потенциально уходящие</h3>
                  <div className="segmentation-count">{segmentation.potentiallyChurning.length}</div>
                </div>
              </div>
              <div className="segmentation-card referrals">
                <div className="segmentation-icon">🕹️</div>
                <div className="segmentation-content">
                  <h3>Рефералы</h3>
                  <div className="segmentation-count">{segmentation.referrals}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="segmentation-placeholder">Загрузка...</div>
          )}
        </div>
      )}

      {/* ROI программы лояльности (Pro) */}
      {isPro && (
        <div className="analytics-section">
          <h2 className="section-title">ROI программы лояльности</h2>
          {roi ? (
            <div className="roi-content">
              <div className="roi-grid">
                <div className="roi-card">
                  <div className="roi-label">Инвестировано (баллы выдано)</div>
                  <div className="roi-value">{roi.pointsIssuedCost} ₽</div>
                  <div className="roi-subvalue">{roi.pointsIssued} баллов</div>
                </div>
                <div className="roi-card">
                  <div className="roi-label">Выручка от программы</div>
                  <div className="roi-value positive">{roi.estimatedRevenue} ₽</div>
                  <div className="roi-subvalue">{roi.purchases} покупок</div>
                </div>
                <div className="roi-card">
                  <div className="roi-label">Чистая прибыль</div>
                  <div className={`roi-value ${parseFloat(roi.netProfit) >= 0 ? 'positive' : 'negative'}`}>
                    {roi.netProfit} ₽
                  </div>
                </div>
                <div className="roi-card">
                  <div className="roi-label">ROI</div>
                  <div className={`roi-value ${parseFloat(roi.roi) >= 0 ? 'positive' : 'negative'}`}>
                    {roi.roi}%
                  </div>
                </div>
              </div>
              <div className="roi-details">
                <div className="roi-detail-item">
                  <span>Средний чек:</span>
                  <span>{roi.avgPurchaseValue} ₽</span>
                </div>
                <div className="roi-detail-item">
                  <span>Среднее визитов на клиента:</span>
                  <span>{roi.avgVisitsPerClient}</span>
                </div>
                <div className="roi-detail-item">
                  <span>LTV (Lifetime Value):</span>
                  <span>{roi.clv} ₽</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="roi-placeholder">Загрузка...</div>
          )}
        </div>
      )}

      <ProModal />
    </div>
  )
}

export default Analytics

