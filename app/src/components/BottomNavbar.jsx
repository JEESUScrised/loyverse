import './BottomNavbar.css'

function BottomNavbar({ currentPath, onNavigate }) {
  return (
    <nav className="bottom-navbar">
      <button
        className={`nav-item ${currentPath === '/' ? 'active' : ''}`}
        onClick={() => onNavigate('/')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Главная</span>
      </button>
      <button
        className={`nav-item ${currentPath === '/venues' ? 'active' : ''}`}
        onClick={() => onNavigate('/venues')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>Заведения</span>
      </button>
    </nav>
  )
}

export default BottomNavbar
