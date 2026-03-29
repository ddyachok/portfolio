import Navbar from '../components/Navbar'
import styles from './Contact.module.css'

export default function Contact() {
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
            <img src="/images/photo.jpg" alt="Danylo Dyachok" className={styles.photo} />
          </div>
        </div>
        <div className={styles.links}>
          <a href="mailto:danieldyachok@gmail.com" className={styles.link}>
            <span className={styles.linkLabel}>Email</span>
            <span className={styles.linkValue}>danieldyachok@gmail.com</span>
          </a>
          <a href="https://github.com/ddyachok" target="_blank" rel="noopener noreferrer" className={styles.link}>
            <span className={styles.linkLabel}>GitHub</span>
            <span className={styles.linkValue}>https://github.com/ddyachok</span>
          </a>
          <a href="https://www.linkedin.com/in/danylo-dyachok-528626153/" target="_blank" rel="noopener noreferrer" className={styles.link}>
            <span className={styles.linkLabel}>LinkedIn</span>
            <span className={styles.linkValue}>https://www.linkedin.com/in/danylo-dyachok/</span>
          </a>
          <a href="https://www.instagram.com/danylodyachok/" target="_blank" rel="noopener noreferrer" className={styles.link}>
            <span className={styles.linkLabel}>Instagram</span>
            <span className={styles.linkValue}>@danylodyachok</span>
          </a>
        </div>
      </div>
    </div>
  )
}
