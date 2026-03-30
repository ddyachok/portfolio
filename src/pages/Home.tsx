import { Link } from 'react-router-dom'
import styles from './Home.module.css'
import logoSrc from '../assets/logo-white.png'

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <img src={logoSrc} alt="" className={styles.logo} aria-hidden="true" />

        <div className={styles.top}>
          <div className={styles.brushMark} />
          <h1 className={styles.name}>
            Danylo<br />Dyachok
          </h1>
          <div className={styles.role}>iOS Developer</div>
        </div>

        <div className={styles.bottom}>
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
