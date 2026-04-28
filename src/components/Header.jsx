import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>VOCE FEMMINILE</h1>
      <nav className={styles.nav}>
        <a href="#evento">El Evento</a>
        <a href="#integrantes">Integrantes</a>
        <a href="#nosotras">Nosotras</a>
        <a href="#boletos" className={styles.navCta}>Reservar</a>
      </nav>
    </header>
  )
}
