import { useState, useEffect } from 'react'
import api from '@shared/api.js'
import QRGenerator from '../components/QRGenerator'
import QRScanner from '../components/QRScanner'
import './Dashboard.css'

function Dashboard({ onLogout }) {
  const [showQRGenerator, setShowQRGenerator] = useState(true)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [venueId, setVenueId] = useState(null)
  const [venue, setVenue] = useState(null)
  const [pointsPerVisit, setPointsPerVisit] = useState(10)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVenue()
  }, [])

  const loadVenue = async () => {
    try {
      const savedVenueId = localStorage.getItem('cashier_venue_id')
      if (savedVenueId) {
        const venueIdNum = parseInt(savedVenueId, 10)
        setVenueId(venueIdNum)
        
        const venueData = await api.getVenue(venueIdNum)
        if (venueData) {
          setVenue(venueData)
          setPointsPerVisit(venueData.pointsPerVisit || 10)
        }
      }
    } catch (error) {
      console.error('Error loading venue:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScanPurchase = async (qrData) => {
    console.log('Сканирование покупки:', qrData)
    
    try {
      // Parse QR data
      const purchaseData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData
      
      // Process the purchase through API
      await api.spendPoints({
        userId: purchaseData.userId,
        venueId: purchaseData.venueId,
        points: purchaseData.points,
        menuItemId: purchaseData.menuItemId,
        menuItemName: purchaseData.menuItemName,
        pointsType: purchaseData.pointsType
      })
      
      alert(`Покупка подтверждена! Списано ${purchaseData.points} баллов`)
    } catch (error) {
      console.error('Error processing purchase:', error)
      alert('Ошибка обработки покупки: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <img src="/LOGO.png" alt="Loyverse" className="dashboard-logo" />
        </div>
        <div className="dashboard-content">
          <div className="dashboard-loading">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <img src="/LOGO.png" alt="Loyverse" className="dashboard-logo" />
        <button className="dashboard-logout" onClick={onLogout}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>

      <div className="dashboard-content">
        {!venueId ? (
          <div className="dashboard-loading">Заведение не найдено</div>
        ) : !showQRScanner ? (
          <>
            <QRGenerator 
              venueId={venueId}
              pointsPerVisit={pointsPerVisit}
              venueName={venue?.name}
            />

            <button 
              className="dashboard-scan-button"
              onClick={() => {
                setShowQRGenerator(false)
                setShowQRScanner(true)
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
              <span>Сканировать QR-код покупки</span>
            </button>
          </>
        ) : (
          <QRScanner
            onScanSuccess={handleScanPurchase}
            onClose={() => {
              setShowQRScanner(false)
              setShowQRGenerator(true)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard
