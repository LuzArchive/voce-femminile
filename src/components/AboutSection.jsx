import styles from './AboutSection.module.css'

export default function AboutSection() {
  return (
    <section id="nosotras" className={styles.section}>
      <div className={styles.accentBar} />
      <div className={styles.content}>
        <h2 className={styles.title}>¿Quiénes somos?</h2>
        <p className={styles.text}>
          Somos un eco que comenzó en la infancia y floreció en la madurez. No somos voces perfectas; somos almas que han crecido juntas, tejiendo una red de sororidad que hoy se transforma en canto. En este espacio seguro, nuestras vivencias diarias se vuelven armonía y nuestra cotidianidad se hace música.
        </p>
        <p className={styles.text}>
          Nos subimos al escenario no para ser escuchadas, sino para ser sentidas. Porque el canto no le pertenece a la técnica, le pertenece al corazón que se atreve a ser uno mismo con los demás.
        </p>
      </div>
    </section>
  )
}
