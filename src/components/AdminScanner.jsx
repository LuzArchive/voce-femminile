import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Html5Qrcode } from 'html5-qrcode'
import styles from './AdminScanner.module.css'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'vocefemminile2026'

export default function AdminScanner() {
  const [autenticado, setAutenticado] = useState(false)
  const [password, setPassword] = useState('')
  const [errorPass, setErrorPass] = useState('')
  const [escaneando, setEscaneando] = useState(false)
  const [resultado, setResultado] = useState(null) // null | 'valido' | 'usado' | 'invalido'
  const [boleto, setBoleto] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const scannerRef = useRef(null)
  const html5QrRef = useRef(null)

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAutenticado(true)
      setErrorPass('')
    } else {
      setErrorPass('Contraseña incorrecta')
    }
  }

  const iniciarScanner = async () => {
    setResultado(null)
    setBoleto(null)
    setEscaneando(true)
  }

  useEffect(() => {
    if (!escaneando || !scannerRef.current) return

    const html5Qr = new Html5Qrcode('qr-reader')
    html5QrRef.current = html5Qr

    html5Qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (codigoQr) => {
        await html5Qr.stop()
        setEscaneando(false)
        await validarQr(codigoQr)
      },
      () => {} // errores silenciosos mientras busca
    ).catch(err => {
      console.error('Error camara:', err)
      setEscaneando(false)
    })

    return () => {
      html5Qr.stop().catch(() => {})
    }
  }, [escaneando])

  const validarQr = async (codigo) => {
    setProcesando(true)

    const { data, error } = await supabase
      .from('boletos')
      .select('*')
      .eq('codigo_qr', codigo)
      .single()

    if (error || !data) {
      setResultado('invalido')
      setProcesando(false)
      return
    }

    if (data.validado) {
      setBoleto(data)
      setResultado('usado')
      setProcesando(false)
      return
    }

    // Marcar como validado
    await supabase
      .from('boletos')
      .update({ validado: true, validado_en: new Date().toISOString() })
      .eq('id', data.id)

    setBoleto(data)
    setResultado('valido')
    setProcesando(false)
  }

  // Pantalla de login
  if (!autenticado) {
    return (
      <div className={styles.page}>
        <div className={styles.loginCard}>
          <div className={styles.logoSmall}>VOCE FEMMINILE</div>
          <h2 className={styles.loginTitle}>Acceso Admin</h2>
          <p className={styles.loginSubtitle}>Validación de boletos</p>
          <input
            className={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          {errorPass && <p className={styles.errorMsg}>{errorPass}</p>}
          <button className={styles.btnPrimary} onClick={handleLogin}>
            Entrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.scannerCard}>
        <div className={styles.cardHeader}>
          <div className={styles.logoSmall}>VOCE FEMMINILE</div>
          <h2 className={styles.scanTitle}>Validar Boleto</h2>
        </div>

        {/* Estado: esperando escanear */}
        {!escaneando && !procesando && !resultado && (
          <div className={styles.idleState}>
            <div className={styles.qrIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
                <rect x="19" y="14" width="2" height="2"/><rect x="14" y="19" width="2" height="2"/>
                <rect x="19" y="19" width="2" height="2"/><rect x="17" y="17" width="0" height="0"/>
              </svg>
            </div>
            <p className={styles.idleText}>Listo para escanear</p>
            <button className={styles.btnPrimary} onClick={iniciarScanner}>
              Abrir cámara
            </button>
          </div>
        )}

        {/* Escáner activo */}
        {escaneando && (
          <div className={styles.scannerArea}>
            <div id="qr-reader" ref={scannerRef} className={styles.qrReader} />
            <p className={styles.scanHint}>Apunta la cámara al código QR del boleto</p>
            <button className={styles.btnSecondary} onClick={() => {
              html5QrRef.current?.stop().catch(() => {})
              setEscaneando(false)
            }}>
              Cancelar
            </button>
          </div>
        )}

        {/* Procesando */}
        {procesando && (
          <div className={styles.processingState}>
            <div className={styles.spinner} />
            <p>Verificando boleto...</p>
          </div>
        )}

        {/* Resultado: válido */}
        {resultado === 'valido' && boleto && (
          <div className={styles.resultado}>
            <div className={styles.resultIconValido}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className={styles.resultTitle}>Boleto válido</h3>
            <div className={styles.boletoInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Nombre</span>
                <span className={styles.infoValue}>{boleto.nombre}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Boletos</span>
                <span className={styles.infoValue}>{boleto.cantidad}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Correo</span>
                <span className={styles.infoValue}>{boleto.email}</span>
              </div>
            </div>
            <p className={styles.resultNote}>✓ Marcado como ingresado</p>
            <button className={styles.btnPrimary} onClick={iniciarScanner}>
              Escanear siguiente
            </button>
          </div>
        )}

        {/* Resultado: ya usado */}
        {resultado === 'usado' && boleto && (
          <div className={styles.resultado}>
            <div className={styles.resultIconUsado}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className={styles.resultTitle}>Ya fue escaneado</h3>
            <div className={styles.boletoInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Nombre</span>
                <span className={styles.infoValue}>{boleto.nombre}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Validado</span>
                <span className={styles.infoValue}>
                  {new Date(boleto.validado_en).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <p className={styles.resultNoteWarning}>Este boleto ya fue usado en la entrada</p>
            <button className={styles.btnPrimary} onClick={iniciarScanner}>
              Escanear siguiente
            </button>
          </div>
        )}

        {/* Resultado: inválido */}
        {resultado === 'invalido' && (
          <div className={styles.resultado}>
            <div className={styles.resultIconInvalido}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <h3 className={styles.resultTitle}>Boleto no válido</h3>
            <p className={styles.resultNoteError}>Este código no existe en el sistema</p>
            <button className={styles.btnPrimary} onClick={iniciarScanner}>
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
