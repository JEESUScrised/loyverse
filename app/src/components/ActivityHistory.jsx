import './ActivityHistory.css'

function ActivityHistory({ activities }) {
  const displayActivities = activities || []

  const formatDate = (date) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diff = now - activityDate
    
    if (diff < 60000) return 'Только что'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} дн назад`
    
    return activityDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="activity-history">
      <h3 className="activity-title">Последняя активность</h3>
      <div className="activity-list">
        {displayActivities.length === 0 ? (
          <div className="activity-empty">Нет активности</div>
        ) : displayActivities.slice(0, 5).map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-icon">
              {activity.type === 'earned' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : activity.type === 'expired' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              )}
            </div>
            <div className="activity-content">
              <div className="activity-description">
                {activity.type === 'earned' 
                  ? `Получено ${activity.points} баллов`
                  : activity.type === 'expired'
                  ? `Сгорело ${activity.points} баллов`
                  : `Потрачено ${activity.points} баллов`
                }
              </div>
              <div className="activity-venue">{activity.venue || 'Заведение'}</div>
            </div>
            <div className="activity-meta">
              <div className={`activity-points ${activity.type}`}>
                {activity.type === 'earned' ? '+' : activity.type === 'expired' ? '−' : '-'}{activity.points}
              </div>
              <div className="activity-time">{formatDate(activity.date)}</div>
            </div>
          </div>
        ))
        }
      </div>
    </div>
  )
}

export default ActivityHistory
