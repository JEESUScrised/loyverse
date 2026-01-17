import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import './QRGenerator.css'

function QRGenerator({ venueId, pointsPerVisit }) {
  const [qrData, setQrData] = useState(null)
  const [updateCounter, setUpdateCounter] = useState(0)

  useEffect(() => {
    // Генерируем начальный QR-код
    generateQRData()

    // Обновляем QR-код каждые 10 секунд
    const interval = setInterval(() => {
      setUpdateCounter(prev => prev + 1)
      generateQRData()
    }, 10000)

    return () => clearInterval(interval)
  }, [venueId, pointsPerVisit])

  const generateQRData = () => {
    const data = {
      code: `venue_${venueId}_${Date.now()}`,
      points: pointsPerVisit,
      venueId: venueId,
      pointsType: 'common', // или 'personal' в зависимости от заведения
      timestamp: Date.now()
    }
    setQrData(data)
  }

  if (!qrData) {
    return (
      <div className="qr-generator">
        <div className="qr-generator-loading">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="qr-generator">
      <div className="qr-generator-card">
        <div className="qr-generator-title">QR-код для выдачи баллов</div>
        <div className="qr-generator-info">
          <div className="qr-generator-info-item">
            <span>Заведение ID:</span>
            <span className="qr-generator-value">{venueId}</span>
          </div>
          <div className="qr-generator-info-item">
            <span>Баллов за посещение:</span>
            <span className="qr-generator-value">{pointsPerVisit}</span>
          </div>
        </div>
        
        <div className="qr-generator-code-wrapper">
          <QRCodeSVG 
            value={JSON.stringify(qrData)}
            size={280}
            level="H"
            includeMargin={true}
            fgColor="#1A1A1A"
            bgColor="#FFFFFF"
          />
        </div>

        <div className="qr-generator-instruction">
          Клиент сканирует этот код для получения баллов
        </div>
        <div className="qr-generator-update">
          QR-код обновляется каждые 10 секунд
        </div>
      </div>
    </div>
  )
}

export default QRGenerator
