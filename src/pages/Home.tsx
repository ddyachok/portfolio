import { Link } from 'react-router-dom'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.brushMark} />
        <h1 className={styles.name}>
          Danylo<br />Dyachok
        </h1>
        <div className={styles.role}>iOS Developer</div>
        <nav className={styles.nav}>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <div className={styles.meta}>Lviv, Ukraine · Remote · NerdzLab</div>
      </div>
    </div>
  )
}
