import ActivityHistory from '../components/ActivityHistory'
import './Home.css'

function Home({ points, activities, onScanQR }) {
  return (
    <div className="home">
      <div className="home-container">
        <div className="home-header">
          <img src="/LOGO.png" alt="Loyverse" className="home-logo" />
        </div>
        
        <div className="points-card">
          <div className="points-label">Ваши баллы</div>
          <div className="points-value-wrapper">
            <img src="/Coin.svg" alt="Монетка" className="points-coin-icon" />
            <div className="points-value">{points}</div>
          </div>
        </div>

        <button className="scan-button" onClick={onScanQR}>
          <svg 
            className="scan-button-icon"
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="5" height="5" rx="0.5"/>
            <rect x="16" y="3" width="5" height="5" rx="0.5"/>
            <rect x="3" y="16" width="5" height="5" rx="0.5"/>
            <rect x="10" y="10" width="1.5" height="1.5"/>
            <rect x="12.5" y="10" width="1.5" height="1.5"/>
            <rect x="10" y="12.5" width="1.5" height="1.5"/>
            <rect x="12.5" y="12.5" width="1.5" height="1.5"/>
            <rect x="16" y="10" width="1" height="1"/>
            <rect x="18" y="10" width="1" height="1"/>
            <rect x="16" y="12.5" width="1" height="1"/>
            <rect x="18" y="12.5" width="1" height="1"/>
            <rect x="10" y="16" width="1" height="1"/>
            <rect x="12.5" y="16" width="1" height="1"/>
            <rect x="10" y="18" width="1" height="1"/>
            <rect x="12.5" y="18" width="1" height="1"/>
          </svg>
          <span>Сканировать QR-код</span>
        </button>

        <ActivityHistory activities={activities} />
      </div>
    </div>
  )
}

export default Home
