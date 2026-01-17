import './Notification.css'

function Notification({ message, type = 'error', onClose }) {
  return (
    <div className={`notification notification-${type}`} onClick={onClose}>
      <div className="notification-content">
        <div className="notification-icon">
          {type === 'error' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          )}
        </div>
        <div className="notification-message">{message}</div>
      </div>
    </div>
  )
}

export default Notification
