import Navbar from '../components/Navbar'
import styles from './ContactA.module.css'

export default function ContactA() {
  return (
    <div className={styles.page}>
      <div className={styles.photoHalf}>
        <img src="/images/photo.png" alt="Danylo Dyachok" className={styles.photo} />
      </div>
      <div className={styles.contentHalf}>
        <Navbar />
        <div className={styles.inner}>
          <h1 className={styles.title}>Let's talk</h1>
          <div className={styles.bio}>
            iOS developer based in <strong>Lviv, Ukraine</strong>, working remotely.
            I care about clean architecture, smooth animations, and apps that feel right in your hand.
            <br /><br />
            Currently at <strong>NerdzLab</strong>. Always interested in challenging
            problems and meaningful collaboration.
          </div>
          <div className={styles.status}>
            <span className={styles.dot} />
            Open to remote opportunities
          </div>
          <div className={styles.links}>
            <a href="mailto:danieldyachok@gmail.com" className={styles.link}>
              <span className={styles.linkLabel}>Email</span>
              <span className={styles.linkValue}>danieldyachok@gmail.com</span>
            </a>
            <a href="https://github.com/danylodya" target="_blank" rel="noopener noreferrer" className={styles.link}>
              <span className={styles.linkLabel}>GitHub</span>
              <span className={styles.linkValue}>github.com/danylodya</span>
            </a>
            <a href="https://linkedin.com/in/danylodya" target="_blank" rel="noopener noreferrer" className={styles.link}>
              <span className={styles.linkLabel}>LinkedIn</span>
              <span className={styles.linkValue}>linkedin.com/in/danylodya</span>
            </a>
            <a href="https://instagram.com/danylodya" target="_blank" rel="noopener noreferrer" className={styles.link}>
              <span className={styles.linkLabel}>Instagram</span>
              <span className={styles.linkValue}>@danylodya</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
