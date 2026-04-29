import maestroImg from '../../images/maestro.png'
import styles from './DirectorSection.module.css'

export default function DirectorSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>

        <div className={styles.photoCol}>
          <div className={styles.photoWrapper}>
            <img src={maestroImg} alt="Christian Ramírez" className={styles.photo} />
          </div>
          <div className={styles.photoAccent} />
        </div>

        <div className={styles.infoCol}>
          <span className={styles.sectionLabel}>Nuestro Director</span>
          <h2 className={styles.name}>Christian Ramírez</h2>
          <p className={styles.credentials}>
            Estudiante de octavo semestre en la Licenciatura en Música, especialidad en Dirección Coral por el Instituto Superior de Música Esperanza Azteca. Cuenta con estudios en Piano Funcional y Técnica Vocal.
          </p>
          <div className={styles.divider} />
          <blockquote className={styles.quote}>
            "Siempre dije que quería convertirme en el Director Coral que a mí me hubiera gustado tener."
          </blockquote>
          <p className={styles.bio}>
            Voce Femminile nació en 2024 como un espacio de práctica y exploración coral a la mitad de su formación. Con el tiempo, tras su debut y presentaciones en diversos escenarios de Huamantla y alrededores, dejó de ser un laboratorio pedagógico para convertirse en una red de apoyo artístico y humano — cambiando su concepción de los coros comunitarios: la gente que canta en coro lo hace porque ama cantar con otra gente. 💜
          </p>
        </div>

      </div>
    </section>
  )
}
