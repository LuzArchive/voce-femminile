import styles from './PagoResultado.module.css'

export default function PagoFallido() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconError}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <h1 className={styles.title}>Pago no completado</h1>
        <p className={styles.subtitle}>Tu boleto no fue cobrado. Puedes intentarlo de nuevo cuando quieras.</p>
        <a href="/#boletos" className={styles.btn}>Intentar de nuevo</a>
      </div>
    </div>
  )
}
