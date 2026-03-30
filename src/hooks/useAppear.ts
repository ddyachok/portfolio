import { useState, useEffect, type CSSProperties } from 'react'

export default function useAppear() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 10)
    return () => clearTimeout(id)
  }, [])

  const fadeUp = (delay = 0, duration = 0.6): CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity ${duration}s ease ${delay}s, transform ${duration}s ease ${delay}s`,
  })

  const fadeIn = (delay = 0, duration = 0.6, to = 1): CSSProperties => ({
    opacity: ready ? to : 0,
    transition: `opacity ${duration}s ease ${delay}s`,
  })

  const brushGrow = (delay = 0, axis: 'X' | 'Y' = 'Y'): CSSProperties => ({
    clipPath: ready
      ? 'inset(0)'
      : axis === 'Y' ? 'inset(0 0 100% 0)' : 'inset(0 100% 0 0)',
    opacity: ready ? 1 : 0,
    transition: `clip-path 0.8s ease ${delay}s, opacity 0.4s ease ${delay}s`,
  })

  return { fadeUp, fadeIn, brushGrow, ready }
}
