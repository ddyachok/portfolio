import { Link } from 'react-router-dom'
import useAppear from '../hooks/useAppear'
import styles from './Home.module.css'
import logoSrc from '../assets/logo-white.png'

export default function Home() {
  const { fadeUp, fadeIn, brushGrow } = useAppear()

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <img src={logoSrc} alt="" className={styles.logo} style={fadeIn(0.6, 1.2, 0.11)} aria-hidden="true" />

        <div className={styles.top}>
          <div className={styles.brushMark} style={brushGrow(0, 'Y')} />
          <h1 className={styles.name} style={fadeUp(0.15, 0.7)}>
            Danylo<br />Dyachok
          </h1>
          <div className={styles.role} style={fadeUp(0.3, 0.7)}>iOS Developer</div>
        </div>

        <div className={styles.bottom} style={fadeUp(0.45, 0.7)}>
          <nav className={styles.nav}>
            <Link to="/blog" className={styles.btn}>Blog</Link>
            <Link to="/contact" className={`${styles.btn} ${styles.primary}`}>Contact</Link>
          </nav>
          <div className={styles.meta}>Lviv, Ukraine · Remote</div>
        </div>
      </div>
    </div>
  )
}
