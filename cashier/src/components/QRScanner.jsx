import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import './QRScanner.css'

function QRScanner({ onScanSuccess, onClose }) {
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

      try {
        // Пытаемся распарсить как JSON
        let qrData
        try {
          qrData = JSON.parse(decodedText)
        } catch (e) {
          setMessage('Неверный формат QR-кода')
          setMessageType('error')
          setTimeout(() => {
            setMessage(null)
            // Перезапускаем сканер
            restartScanner()
          }, 2000)
          return
        }

        // Проверяем, является ли это QR-кодом покупки
        if (qrData.userId && qrData.venueId && qrData.menuItemId && qrData.points) {
          // Это QR-код покупки - обрабатываем списание баллов
          if (onScanSuccess) {
            onScanSuccess(qrData)
            setMessage(`Покупка обработана! Списано ${qrData.points} баллов`)
            setMessageType('success')
            
            // Закрываем через 2 секунды
            setTimeout(() => {
              onClose()
            }, 2000)
          }
        } else {
          setMessage('Это не QR-код покупки')
          setMessageType('error')
          setTimeout(() => {
            setMessage(null)
            restartScanner()
          }, 2000)
        }
      } catch (error) {
        console.error('Ошибка обработки QR-кода:', error)
        setMessage('Ошибка обработки QR-кода')
        setMessageType('error')
        setTimeout(() => {
          setMessage(null)
          restartScanner()
        }, 2000)
      }
    }
  }

  const restartScanner = () => {
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
          console.error('Ошибка перезапуска камеры:', err)
        })
    }
  }

  return (
    <div className="qr-scanner-cashier">
      <div className="scanner-content-cashier">
        <div className="scanner-hint-cashier">
          Наведите камеру на QR-код покупки
        </div>

        <div className="qr-reader-cashier" id="qr-reader-cashier" ref={scannerRef}></div>

        {message && (
          <div className={`scanner-message-cashier ${messageType}`}>
            {message}
          </div>
        )}

      </div>
    </div>
  )
}

export default QRScanner
