import { QRCodeSVG } from 'qrcode.react'
import './PurchaseQR.css'

function PurchaseQR({ purchaseData, onClose, itemName, itemPrice }) {
  if (!purchaseData) {
    return null
  }
  
  const qrData = JSON.stringify(purchaseData)

  return (
    <div className="purchase-qr-overlay" onClick={onClose}>
      <div className="purchase-qr-container" onClick={(e) => e.stopPropagation()}>
        <div className="purchase-qr-header">
          <h2 className="purchase-qr-title">Покажите QR-код кассиру</h2>
          <button className="purchase-qr-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div className="purchase-qr-content">
          <div className="purchase-qr-info">
            <div className="purchase-qr-item-name">{itemName}</div>
            <div className="purchase-qr-item-price">Стоимость: {itemPrice} баллов</div>
          </div>
          
          <div className="purchase-qr-code-wrapper">
            <QRCodeSVG 
              value={qrData}
              size={280}
              level="H"
              includeMargin={true}
              fgColor="#1A1A1A"
              bgColor="#FFFFFF"
            />
          </div>
          
          <div className="purchase-qr-instruction">
            Кассир отсканирует этот код для списания баллов
          </div>
        </div>
      </div>
    </div>
  )
}

export default PurchaseQR
