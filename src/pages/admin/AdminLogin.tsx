import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient } from '../../lib/neonAuth'
import styles from './AdminLogin.module.css'

type Mode = 'signin' | 'signup'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signup') {
      const result = await authClient.signUp.email({ name, email, password })
      if (result.error) {
        setError(result.error.message ?? 'Sign up failed')
        setLoading(false)
        return
      }
    } else {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) {
        setError('Invalid credentials')
        setLoading(false)
        return
      }
    }

    navigate('/admin/posts')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brushMark} />
        <h1 className={styles.title}>Admin</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'signup' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading
              ? mode === 'signup' ? 'Creating account…' : 'Signing in…'
              : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          className={styles.modeToggle}
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
        >
          {mode === 'signin' ? 'First time? Create account' : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
