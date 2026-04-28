import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import QRCode from 'qrcode'
import styles from './PagoResultado.module.css'

export default function PagoExitoso() {
  const [searchParams] = useSearchParams()
  const [boleto, setBoleto] = useState(null)
  const [qrUrl, setQrUrl] = useState(null)
  const [intentos, setIntentos] = useState(0)

  // Leer boleto_id de la URL o del sessionStorage
  const boleto_id = searchParams.get('boleto_id') || sessionStorage.getItem('ultimo_boleto_id')

  useEffect(() => {
    if (!boleto_id) return

    const buscarBoleto = async () => {
      const { data } = await supabase
        .from('boletos')
        .select('*')
        .eq('id', boleto_id)
        .single()

      if (data?.estado === 'pagado' && data?.codigo_qr) {
        setBoleto(data)
        sessionStorage.removeItem('ultimo_boleto_id')
        const url = await QRCode.toDataURL(data.codigo_qr, {
          width: 250,
          margin: 2,
          color: { dark: '#0a0a0a', light: '#ffffff' }
        })
        setQrUrl(url)
      } else {
        setIntentos(prev => prev + 1)
      }
    }

    buscarBoleto()
  }, [boleto_id, intentos])

  useEffect(() => {
    if (intentos > 0 && intentos < 15 && !boleto) {
      const timer = setTimeout(() => setIntentos(prev => prev + 1), 2000)
      return () => clearTimeout(timer)
    }
  }, [intentos, boleto])

  // Si no hay boleto_id en ningún lado, mostrar mensaje genérico
  if (!boleto_id) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.iconSuccess}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 className={styles.title}>Pago recibido</h1>
          <p className={styles.subtitle}>Recibirás tu boleto con QR en tu correo en unos minutos.</p>
          <a href="/" className={styles.btn}>Volver al inicio</a>
        </div>
      </div>
    )
  }

  const cargando = !boleto && intentos < 15
  const timeout = !boleto && intentos >= 15

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {cargando ? (
          <>
            <div className={styles.spinner} />
            <p className={styles.message}>Confirmando tu pago...</p>
            <p className={styles.hint}>Esto toma unos segundos</p>
          </>
        ) : timeout ? (
          <>
            <div className={styles.iconSuccess}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 className={styles.title}>Pago recibido</h1>
            <p className={styles.subtitle}>
              Recibirás tu boleto con QR en tu correo en unos minutos.
            </p>
            <a href="/" className={styles.btn}>Volver al inicio</a>
          </>
        ) : (
          <>
            <div className={styles.iconSuccess}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 className={styles.title}>Pago exitoso</h1>
            <p className={styles.subtitle}>
              Tu boleto está confirmado, <strong>{boleto.nombre.split(' ')[0]}</strong>
            </p>

            {qrUrl && (
              <div className={styles.qrWrapper}>
                <p className={styles.qrLabel}>Presenta este codigo en la entrada</p>
                <img src={qrUrl} alt="Codigo QR" className={styles.qrImage} />
                <p className={styles.qrId}>{boleto.codigo_qr}</p>
              </div>
            )}

            <div className={styles.info}>
              <p>También enviamos tu QR a</p>
              <p><strong>{boleto.email}</strong></p>
            </div>

            <a href="/" className={styles.btn}>Volver al inicio</a>
          </>
        )}
      </div>
    </div>
  )
}
