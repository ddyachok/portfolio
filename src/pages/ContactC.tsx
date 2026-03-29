import Navbar from '../components/Navbar'
import styles from './ContactC.module.css'

export default function ContactC() {
  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.bio}>
            <h1 className={styles.title}>Let's talk</h1>
            <p className={styles.bioText}>
              iOS developer based in <strong>Lviv, Ukraine</strong>, working remotely.
              I care about clean architecture, smooth animations, and apps that feel right in your hand.
              Currently at <strong>NerdzLab</strong>.
            </p>
            <div className={styles.status}>
              <span className={styles.dot} />
              Open to remote opportunities
            </div>
          </div>
          <div className={styles.photoWrap}>
            <img src="/images/photo.png" alt="Danylo Dyachok" className={styles.photo} />
          </div>
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
  )
}
