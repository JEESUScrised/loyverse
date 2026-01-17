import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import './QRScanner.css'

function QRScanner({ onPointsAdded, onVenuePointsAdded, onClose, onPurchaseScanned, telegramId }) {
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState(null)

  useEffect(() => {
    if (scannerRef.current && !html5QrCodeRef.current) {
      const html5QrCode = new Html5Qrcode(scannerRef.current.id)
      html5QrCodeRef.current = html5QrCode

      const config = {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
        disableFlip: false
      }

      html5QrCode
        .start(
          { facingMode: 'environment' },
          config,
          (decodedText, decodedResult) => {
            handleScanSuccess(decodedText)
          },
          (errorMessage) => {
            // Игнорируем ошибки сканирования
          }
        )
        .then(() => {
          setIsScanning(true)
        })
        .catch((err) => {
          console.error('Ошибка запуска камеры:', err)
          setMessage('Не удалось запустить камеру')
          setMessageType('error')
        })
    }

    return () => {
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            html5QrCodeRef.current.clear()
            html5QrCodeRef.current = null
          })
          .catch((err) => {
            console.error('Ошибка остановки сканера:', err)
          })
      }
    }
  }, [])

  const handleScanSuccess = async (decodedText) => {
    if (html5QrCodeRef.current && isScanning) {
      // Останавливаем сканер после успешного сканирования
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear()
        html5QrCodeRef.current = null
        setIsScanning(false)
      })

      // Проверяем QR-код и начисляем баллы или обрабатываем покупку
      // В реальном приложении здесь будет запрос к API
      try {
        // Пытаемся распарсить как JSON
        let qrData
        let venueName = 'Заведение'
        
        try {
          qrData = JSON.parse(decodedText)
          
          // Проверяем, является ли это QR-кодом покупки
          if (qrData.userId && qrData.venueId && qrData.menuItemId && qrData.points) {
            // Это QR-код покупки - обрабатываем списание баллов
            if (onPurchaseScanned && telegramId && qrData.userId === telegramId) {
              // Пользователь сканирует свой QR-код покупки - списываем баллы
              const success = onPurchaseScanned(
                qrData.points, 
                qrData.venueId || 'Заведение', 
                qrData.venueId, 
                qrData.menuItemId, 
                qrData.token,
                null,
                qrData.pointsType || 'common'
              )
              if (success) {
                setMessage(`Покупка подтверждена! Списано ${qrData.points} баллов`)
                setMessageType('success')
                
                // Закрываем через 2 секунды
                setTimeout(() => {
                  onClose()
                }, 2000)
                return
              } else {
                setMessage('Недостаточно баллов для покупки')
                setMessageType('error')
                setTimeout(() => {
                  onClose()
                }, 2000)
                return
              }
            } else if (onPurchaseScanned && telegramId && qrData.userId !== telegramId) {
              // Это QR-код покупки, но не для этого пользователя (кассир сканирует)
              // В реальном приложении здесь будет запрос к API для списания баллов
              if (onPurchaseScanned) {
                // Кассир сканирует QR-код покупки - списываем баллы у пользователя
                const success = onPurchaseScanned(
                  qrData.points, 
                  qrData.venueId || 'Заведение', 
                  qrData.venueId, 
                  qrData.menuItemId, 
                  qrData.token,
                  qrData.userId,
                  qrData.pointsType || 'common'
                )
                if (success) {
                  setMessage(`Покупка обработана! Списано ${qrData.points} баллов`)
                  setMessageType('success')
                  setTimeout(() => {
                    onClose()
                  }, 2000)
                } else {
                  setMessage('Ошибка обработки покупки')
                  setMessageType('error')
                  setTimeout(() => {
                    onClose()
                  }, 2000)
                }
              } else {
                setMessage('QR-код покупки распознан. Обработка...')
                setMessageType('success')
                setTimeout(() => {
                  setMessage('Покупка обработана!')
                  setTimeout(() => {
                    onClose()
                  }, 1500)
                }, 1000)
              }
              return
            }
          }
          
          // Если это не QR-код покупки, проверяем как обычный QR-код для начисления баллов
          venueName = qrData.venue || qrData.name || 'Заведение'
        } catch {
          // Если не JSON, проверяем как простую строку
          qrData = { code: decodedText }
        }

        // Валидация QR-кода для начисления баллов (в реальном приложении - проверка на сервере)
        if (qrData.code && qrData.points) {
          const points = parseInt(qrData.points, 10)
          if (points > 0 && points <= 100) {
            // Если указан venueId и pointsType === 'personal', начисляем личные баллы
            if (qrData.venueId && qrData.pointsType === 'personal' && onVenuePointsAdded) {
              onVenuePointsAdded(qrData.venueId, points, venueName)
              setMessage(`Получено ${points} баллов в заведении!`)
            } else {
              // Иначе начисляем общие баллы (передаем venueId если есть)
              onPointsAdded(points, venueName, qrData.venueId || null)
              setMessage(`Получено ${points} баллов!`)
            }
            setMessageType('success')
            
            // Закрываем через 2 секунды
            setTimeout(() => {
              onClose()
            }, 2000)
            return
          }
        }

        // Если формат неверный
        setMessage('Неверный QR-код')
        setMessageType('error')
        setTimeout(() => {
          onClose()
        }, 2000)
      } catch (error) {
        setMessage('Ошибка обработки QR-кода')
        setMessageType('error')
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    }
  }

  return (
    <div className="qr-scanner">
      <div className="scanner-content">
        <div id="qr-reader" ref={scannerRef} className="qr-reader"></div>
        
        {message && (
          <div className={`scanner-message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="scanner-hint">
          Наведите камеру на QR-код
        </div>
      </div>

      <div className="scanner-footer">
        <button className="back-button" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Назад</span>
        </button>
      </div>
    </div>
  )
}

export default QRScanner
