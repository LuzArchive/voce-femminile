import { useState } from 'react'
import styles from './EventCard.module.css'
import ModalCompra from './ModalCompra'

export default function EventCard() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <section id="evento" className={styles.section}>
        <div className={styles.card}>
          <span className={styles.badge}>Espectaculo Coral</span>

          <h2 className={styles.title}>Verdades de<br />Media Noche</h2>
          <p className={styles.subtitle}>Inspirado en el universo musical de los 80s y 90s</p>

          <div className={styles.divider} />

          <div className={styles.infoGrid}>
            <div className={styles.infoBox}>
              <span className={styles.infoLabel}>Fecha y Hora</span>
              <p className={styles.infoMain}>9 de Marzo, 2026</p>
              <p className={styles.infoSub}>
                5:00 <span className={styles.accent}>PM</span>
              </p>
            </div>
            <div className={styles.infoBox}>
              <span className={styles.infoLabel}>Ubicacion</span>
              <p className={styles.infoMain}>Teatro Principal</p>
              <p className={styles.infoSub}>Junto a la parroquia de San Luis Obispo</p>
            </div>
          </div>

          <div className={styles.divider} />

          <div id="boletos" className={styles.ticketArea}>
            <span className={styles.infoLabel}>Costo del Boleto</span>
            <p className={styles.price}>
              <span className={styles.priceCurrency}>$</span>45
              <span className={styles.priceCents}>.00</span>
            </p>
            <button className={styles.ctaButton} onClick={() => setModalOpen(true)}>
              Reservar Ahora
            </button>
          </div>
        </div>
      </section>

      <ModalCompra isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
