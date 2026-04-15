import { Link, useNavigate } from 'react-router-dom'
import { authClient } from '../../lib/neonAuth'
import styles from './AdminNav.module.css'

export default function AdminNav() {
  const navigate = useNavigate()

  async function handleLogout() {
    await authClient.signOut()
    navigate('/admin')
  }

  return (
    <nav className={styles.nav}>
      <Link to="/admin/posts" className={styles.brand}>Admin</Link>
      <button onClick={handleLogout} className={styles.logout}>Logout</button>
    </nav>
  )
}
