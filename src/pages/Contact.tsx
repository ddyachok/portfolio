import Navbar from '../components/Navbar'
import styles from './Contact.module.css'

export default function Contact() {
  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.brushMark} />
          <h1 className={styles.title}>Let's talk</h1>
          <div className={styles.bio}>
            I'm an iOS developer based in <strong>Lviv, Ukraine</strong>, working
            remotely. I care about clean architecture, smooth animations, and apps
            that feel right in your hand.
            <br /><br />
            Currently at <strong>NerdzLab</strong>, building e-commerce and fintech
            products. Always interested in challenging problems and meaningful
            collaboration.
          </div>
          <div className={styles.status}>
            <span className={styles.dot} />
            Open to remote opportunities
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.sectionLabel}>Reach out</div>
          <a href="mailto:danieldyachok@gmail.com" className={styles.linkCard}>
            <div className={styles.linkLabel}>Email</div>
            <div className={styles.linkValue}>danieldyachok@gmail.com</div>
          </a>
          <a href="https://github.com/danylodya" target="_blank" rel="noopener noreferrer" className={styles.linkCard}>
            <div className={styles.linkLabel}>GitHub</div>
            <div className={styles.linkValue}>github.com/danylodya</div>
          </a>
          <a href="https://linkedin.com/in/danylodya" target="_blank" rel="noopener noreferrer" className={styles.linkCard}>
            <div className={styles.linkLabel}>LinkedIn</div>
            <div className={styles.linkValue}>linkedin.com/in/danylodya</div>
          </a>
          <a href="https://instagram.com/danylodya" target="_blank" rel="noopener noreferrer" className={styles.linkCard}>
            <div className={styles.linkLabel}>Instagram</div>
            <div className={styles.linkValue}>@danylodya</div>
          </a>
          <div className={styles.cvNote}>
            CV available on request — or download it directly from the home page.
          </div>
        </div>
      </div>
    </div>
  )
}
