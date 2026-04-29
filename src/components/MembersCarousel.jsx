import { useState } from 'react'
import styles from './MembersCarousel.module.css'

// Importa las fotos que tengas - las que no existan usan la inicial
import ferImg from '../../images/fer.png'
import madaImg from '../../images/mada.png'

const members = [
  { name: 'Fer',    voice: 'Soprano', initial: 'F', photo: ferImg },
  { name: 'Faty',   voice: 'Soprano', initial: 'F', photo: null },
  { name: 'Lupita', voice: 'Soprano', initial: 'L', photo: null },
  { name: 'Abi',    voice: 'Mezzo',   initial: 'A', photo: null },
  { name: 'Mada',   voice: 'Mezzo',   initial: 'M', photo: madaImg },
  { name: 'Dany',   voice: 'Mezzo',   initial: 'D', photo: null },
  { name: 'Andy',   voice: 'Mezzo',   initial: 'A', photo: null },
  { name: 'Ada',    voice: 'Alto',    initial: 'A', photo: null },
  { name: 'Luz',    voice: 'Alto',    initial: 'L', photo: null },
  { name: 'Vicky',  voice: 'Alto',    initial: 'V', photo: null },
]

const voiceColors = {
  Soprano: { bg: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.5)', text: '#6ee7b7' },
  Mezzo:   { bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
  Alto:    { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)', text: '#10b981' },
}

export default function MembersCarousel() {
  const [active, setActive] = useState(0)

  const prev = () => setActive(i => (i - 1 + members.length) % members.length)
  const next = () => setActive(i => (i + 1) % members.length)

  const getPosition = (index) => {
    const total = members.length
    let diff = index - active
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total
    return diff
  }

  return (
    <section id="integrantes" className={styles.section}>
      <div className={styles.bgOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      <div className={styles.header}>
        <span className={styles.sectionLabel}>Nuestro Coro</span>
        <h2 className={styles.title}>Conoce a Nuestras<br />Integrantes</h2>
        <p className={styles.subtitle}>Tres voces. Diez almas. Una sola armonía.</p>
      </div>

      <div className={styles.voiceGroups}>
        {['Soprano', 'Mezzo', 'Alto'].map(voice => (
          <button
            key={voice}
            className={styles.voiceTag}
            style={{ '--tag-color': voiceColors[voice].text, '--tag-bg': voiceColors[voice].bg, '--tag-border': voiceColors[voice].border }}
            onClick={() => {
              const idx = members.findIndex(m => m.voice === voice)
              if (idx !== -1) setActive(idx)
            }}
          >
            {voice}
          </button>
        ))}
      </div>

      <div className={styles.carouselWrapper}>
        <div className={styles.carousel}>
          {members.map((member, i) => {
            const pos = getPosition(i)
            const isActive = pos === 0
            const isAdjacent = Math.abs(pos) === 1
            const isVisible = Math.abs(pos) <= 2
            const color = voiceColors[member.voice]

            if (!isVisible) return null

            return (
              <div
                key={member.name}
                className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
                style={{
                  '--pos': pos,
                  '--scale': isActive ? 1 : isAdjacent ? 0.8 : 0.65,
                  '--opacity': isActive ? 1 : isAdjacent ? 0.7 : 0.4,
                  '--z': isActive ? 10 : isAdjacent ? 5 : 1,
                  '--blur': isActive ? '0px' : isAdjacent ? '0px' : '2px',
                  '--card-bg': color.bg,
                  '--card-border': color.border,
                }}
                onClick={() => !isActive && setActive(i)}
              >
                <div className={styles.cardInner}>
                  {member.photo ? (
                    <div className={styles.photoWrapper} style={{ '--av-border': color.border }}>
                      <img
                        src={member.photo}
                        alt={member.name}
                        className={styles.photo}
                      />
                    </div>
                  ) : (
                    <div className={styles.avatar} style={{ '--av-border': color.border, '--av-text': color.text }}>
                      {member.initial}
                    </div>
                  )}
                  <div className={styles.memberInfo}>
                    <span className={styles.voiceBadge} style={{ '--badge-bg': color.bg, '--badge-text': color.text, '--badge-border': color.border }}>
                      {member.voice}
                    </span>
                    <h3 className={styles.memberName}>{member.name}</h3>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.controls}>
        <button className={styles.navBtn} onClick={prev} aria-label="Anterior">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className={styles.dots}>
          {members.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Ir a ${members[i].name}`}
            />
          ))}
        </div>

        <button className={styles.navBtn} onClick={next} aria-label="Siguiente">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  )
}
