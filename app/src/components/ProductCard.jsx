import './ProductCard.css'

function ProductCard({ item, pointsNeeded, currentPoints, onBuy, onClose }) {
  const canAfford = currentPoints >= pointsNeeded

  return (
    <div className="product-card-overlay" onClick={onClose}>
      <div className="product-card-container" onClick={(e) => e.stopPropagation()}>
        <button className="product-card-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <div className="product-card-image-wrapper">
          <img 
            src={item.image} 
            alt={item.name} 
            className="product-card-image"
          />
        </div>

        <div className="product-card-content">
          <h2 className="product-card-name">{item.name}</h2>
          
          {item.weight && (
            <div className="product-card-info-item">
              <span className="product-card-info-label">Вес / Объем:</span>
              <span className="product-card-info-value">{item.weight}</span>
            </div>
          )}

          {item.description && (
            <div className="product-card-description">
              <h3 className="product-card-section-title">Описание</h3>
              <p className="product-card-description-text">{item.description}</p>
            </div>
          )}

          {item.composition && (
            <div className="product-card-composition">
              <h3 className="product-card-section-title">Состав</h3>
              <p className="product-card-composition-text">{item.composition}</p>
            </div>
          )}
          
          <div className="product-card-price">
            <span className="product-card-price-label">Стоимость:</span>
            <span className="product-card-price-value">{pointsNeeded} баллов</span>
          </div>

          <div className="product-card-balance">
            <span className="product-card-balance-label">Ваш баланс:</span>
            <span className={`product-card-balance-value ${!canAfford ? 'insufficient' : ''}`}>
              {currentPoints} баллов
            </span>
          </div>

          {!canAfford && (
            <div className="product-card-warning">
              Недостаточно баллов для покупки
            </div>
          )}

          <button 
            className={`product-card-buy-button ${!canAfford ? 'disabled' : ''}`}
            onClick={canAfford ? onBuy : undefined}
            disabled={!canAfford}
          >
            Купить
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard

