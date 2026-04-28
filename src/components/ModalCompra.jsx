import { useState, useEffect } from 'react'
import { getBoletosDisponibles, crearBoletoPendiente, crearPreferenciaPago } from '../lib/boletos'
import styles from './ModalCompra.module.css'

export default function ModalCompra({ isOpen, onClose }) {
  const [step, setStep] = useState('form')
  const [disponibles, setDisponibles] = useState(null)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', cantidad: 1 })
  const [errores, setErrores] = useState({})
  const [errorGlobal, setErrorGlobal] = useState('')

  useEffect(() => {
    if (isOpen) {
      setStep('form')
      setErrores({})
      setErrorGlobal('')
      setForm({ nombre: '', email: '', telefono: '', cantidad: 1 })
      getBoletosDisponibles().then(setDisponibles)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }))
  }

  const validar = () => {
    const nuevosErrores = {}
    if (!form.nombre.trim()) nuevosErrores.nombre = 'Tu nombre es requerido'
    if (!form.email.trim()) {
      nuevosErrores.email = 'Tu correo es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevosErrores.email = 'Ingresa un correo valido'
    }
    if (!form.telefono.trim()) nuevosErrores.telefono = 'Tu telefono es requerido'
    return nuevosErrores
  }

  const handleSubmit = async () => {
    const nuevosErrores = validar()
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }
    if (disponibles !== null && Number(form.cantidad) > disponibles) {
      setErrorGlobal('Solo quedan ' + disponibles + ' boletos disponibles.')
      return
    }

    setStep('loading')
    setErrorGlobal('')

    try {
      // 1. Guardar boleto pendiente en Supabase
      const boleto = await crearBoletoPendiente({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        cantidad: Number(form.cantidad),
      })

      // 2. Crear preferencia de pago en Mercado Pago
      const pago = await crearPreferenciaPago({
        boleto_id: boleto.id,
        nombre: boleto.nombre,
        email: boleto.email,
        cantidad: boleto.cantidad,
        monto_total: boleto.monto_total,
      })

      // 3. Redirigir a Mercado Pago
      // En modo prueba usamos sandbox_init_point, en produccion init_point
      const urlPago = import.meta.env.DEV ? pago.sandbox_init_point : pago.init_point
      window.location.href = urlPago

    } catch (err) {
      console.error(err)
      setErrorGlobal('Hubo un error al procesar tu reserva. Intenta de nuevo.')
      setStep('form')
    }
  }

  const precio = 45
  const total = precio * Number(form.cantidad)
  const maxCantidad = Math.min(4, disponibles ?? 4)

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.badge}>Espectaculo Coral</span>
            <h2 className={styles.modalTitle}>Reservar Boletos</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {disponibles !== null && (
          <div className={styles.availability + (disponibles <= 10 ? ' ' + styles.availabilityLow : '')}>
            <span className={styles.availabilityDot} />
            {disponibles > 0
              ? disponibles + ' boletos disponibles'
              : 'Agotado - ya no hay boletos disponibles'}
          </div>
        )}

        {step === 'loading' ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Preparando tu pago...</p>
            <p className={styles.loadingNote}>En un momento te redirigiremos a Mercado Pago</p>
          </div>
        ) : (
          <>
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nombre completo</label>
                <input
                  className={styles.input + (errores.nombre ? ' ' + styles.inputError : '')}
                  type="text" name="nombre" placeholder="Maria Gonzalez"
                  value={form.nombre} onChange={handleChange}
                />
                {errores.nombre && <span className={styles.error}>{errores.nombre}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Correo electronico</label>
                <input
                  className={styles.input + (errores.email ? ' ' + styles.inputError : '')}
                  type="email" name="email" placeholder="maria@correo.com"
                  value={form.email} onChange={handleChange}
                />
                {errores.email && <span className={styles.error}>{errores.email}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Telefono</label>
                <input
                  className={styles.input + (errores.telefono ? ' ' + styles.inputError : '')}
                  type="tel" name="telefono" placeholder="247 280 3489"
                  value={form.telefono} onChange={handleChange}
                />
                {errores.telefono && <span className={styles.error}>{errores.telefono}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Cantidad de boletos</label>
                <select
                  className={styles.input} name="cantidad"
                  value={form.cantidad} onChange={handleChange}
                  disabled={disponibles === 0}
                >
                  {Array.from({ length: maxCantidad }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'boleto' : 'boletos'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>{form.cantidad} {Number(form.cantidad) === 1 ? 'boleto' : 'boletos'} x $45.00</span>
                <span className={styles.summaryTotal}>${total}.00</span>
              </div>
            </div>

            {errorGlobal && <div className={styles.errorGlobal}>{errorGlobal}</div>}

            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={disponibles === 0}
            >
              {disponibles === 0 ? 'Sin boletos disponibles' : 'Continuar al pago - $' + total + '.00'}
            </button>

            <p className={styles.disclaimer}>
              Al continuar seras redirigida a Mercado Pago para completar tu pago de forma segura.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
