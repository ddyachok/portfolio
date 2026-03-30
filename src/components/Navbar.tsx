import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'
import useAppear from '../hooks/useAppear'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { pathname } = useLocation()
  const { fadeIn } = useAppear()

  return (
    <nav className={styles.nav} style={fadeIn(0, 0.5)}>
      <Link to="/" className={styles.brand}>
        <Logo size={28} />
      </Link>
      <div className={styles.links}>
        <Link to="/" className={pathname === '/' ? styles.active : ''}>Home</Link>
        <Link to="/blog" className={pathname.startsWith('/blog') ? styles.active : ''}>Blog</Link>
        <Link to="/contact" className={pathname === '/contact' ? styles.active : ''}>Contact</Link>
      </div>
    </nav>
  )
}
